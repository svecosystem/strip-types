import { walk } from 'estree-walker';
import MagicString from 'magic-string';
import { type AST, parse } from 'svelte/compiler';

/** A regular expression that matches empty script tags */
export const EMPTY_SCRIPT_REGEX = new RegExp(/<script\b[^>]*>\s*<\/script>/gi);

export type Options = {
	/** Used for debugging hints. */
	filename?: string;
	/** Should the output be formatted. (Turn this off if you are doing your own formatting) @default true */
	format?: boolean;
	/** Should empty script tags be removed. @default true */
	removeEmptyScripts?: boolean;
};

/** Strips the types from the provided Svelte source.
 *
 * @param source TypeScript source which will have it's types stripped
 * @param options Options for strip
 * @returns
 *
 * ## Usage
 * ```ts
 * import assert from 'node:assert';
 * import { strip } from 'sv-strip';
 *
 * const source = `<script lang="ts">
 *      let value = $state<string>('');
 * </script>
 *
 * <input bind:value/>`
 *
 * const stripped = strip(source);
 *
 * const expected = `<script>
 *       let value = $state('');
 * </script>
 *
 * <input bind:value/>`;
 *
 * assert(stripped === expected);
 * ```
 */
export function strip(
	source: string,
	{ filename = undefined, format = true, removeEmptyScripts = true }: Options = {}
): string {
	const ast = parse(source, { filename });

	const src = new MagicString(source);

	const enter = (node: AST.BaseNode, parent: AST.BaseNode) => {
		// remove lang="ts" if it exists in the script
		if (node.type === 'Script') {
			// @ts-expect-error wrong
			const scriptDeclaration = src.original.slice(node.start, node.content.start);

			const langIndex = scriptDeclaration.search(/ lang=["|']ts["|']/g);

			if (langIndex !== -1) {
				src.update(node.start + langIndex, node.start + langIndex + 10, '');
			}

			const genericsRegex = new RegExp(/ generics=["'][\s\S]+["']/g);

			// @ts-expect-error wrong
			const match = genericsRegex.exec(src.original.slice(node.start, node.content.start));

			if (match !== null) {
				src.update(
					node.start + match.index,
					node.start + match.index + match[0].length,
					''
				);
			}
		}

		// expressions that can just be removed outright
		const tsNodes = [
			'TSTypeParameterInstantiation',
			'TSTypeAnnotation',
			'TSTypeAliasDeclaration',
			'TSInterfaceDeclaration',
		];
		if (tsNodes.includes(node.type)) {
			if (['TSTypeAliasDeclaration', 'TSInterfaceDeclaration'].includes(node.type)) {
				let start = node.start;

				if (parent.type === 'ExportNamedDeclaration') {
					start = parent.start;
				}

				removeNode(src, start, node.end, format);
				return;
			}

			src.update(node.start, node.end, '');
			return;
		}

		// remove type only imports
		if (node.type === 'ImportDeclaration') {
			// @ts-expect-error wrong
			if (node.importKind === 'type') {
				removeNode(src, node.start, node.end, format);
				return;
			}

			// @ts-expect-error wrong
			const remainingSpecifiers = node.specifiers.filter((s) => s.importKind !== 'type');

			// if there were no type only imports do nothing
			// @ts-expect-error wrong
			if (remainingSpecifiers.length === node.specifiers.length) return;

			// if all the specifiers were type only remove the entire thing
			if (remainingSpecifiers.length === 0) {
				removeNode(src, node.start, node.end, format);
				return;
			}

			// combine the remaining specifiers into an import statement
			const updated = remainingSpecifiers
				.map((s: AST.BaseNode) => src.slice(s.start, s.end))
				.join(', ');

			// @ts-expect-error wrong
			src.update(node.start, node.end, `import { ${updated} } from ${node.source.raw};`);

			return;
		}

		// remove type only exports
		if (node.type === 'ExportNamedDeclaration') {
			// @ts-expect-error wrong
			if (node.exportKind === 'type') {
				removeNode(src, node.start, node.end, format);
				return;
			}

			// @ts-expect-error wrong
			const remainingSpecifiers = node.specifiers.filter((s) => s.exportKind !== 'type');

			// if there were no type only imports do nothing
			// @ts-expect-error wrong
			if (remainingSpecifiers.length === node.specifiers.length) return;

			// if all the specifiers were type only remove the entire thing
			if (remainingSpecifiers.length === 0) {
				removeNode(src, node.start, node.end, format);
				return;
			}

			// combine the remaining specifiers into an import statement
			const updated = remainingSpecifiers
				.map((s: AST.BaseNode) => src.slice(s.start, s.end))
				.join(', ');

			src.update(node.start, node.end, `export { ${updated} };`);

			return;
		}

		// remove any accessability modifiers from class property definitions
		// @ts-expect-error wrong
		if (node.type === 'PropertyDefinition' && node.accessibility !== undefined) {
			// @ts-expect-error wrong
			src.update(node.start, node.start + node.accessibility.length + 1, '');
		}

		// expressions are stripped by replacing their node with their expression
		const tsExpressions = ['TSAsExpression', 'TSNonNullExpression', 'TSTypeAssertion'];
		if (tsExpressions.includes(node.type)) {
			// @ts-expect-error wrong
			src.update(node.start, node.end, src.slice(node.expression.start, node.expression.end));
			return;
		}

		// syntax that is unsupported results in an error
		const unsupportedSyntax = ['TSEnumDeclaration', 'TSParameterProperty'];
		if (unsupportedSyntax.includes(node.type)) {
			throw new Error(`Unsupported syntax! ${node.type} is not allowed!`);
		}
	};

	// strip script tag
	// @ts-expect-error It's fine dude
	walk(ast.instance, { enter });

	// strip <script module> tag
	// @ts-expect-error It's fine dude
	walk(ast.module, { enter });

	// strip templates
	// @ts-expect-error It's fine dude
	walk(ast.html, { enter });

	let content = src.toString();

	if (removeEmptyScripts) {
		content = content.replaceAll(EMPTY_SCRIPT_REGEX, '');
	}

	if (format) {
		return content.trim();
	}

	return content;
}

/** Removes the entire node and any leading / trailing whitespace
 *
 * @param src
 * @param start
 * @param end
 */
function removeNode(src: MagicString, start: number, end: number, format: boolean) {
	let newStart = start;
	let newEnd = end;

	if (format) {
		let isLast = false;

		// remove whitespace beyond the node until the proceeding whitespace of the next node
		for (let i = end; i < src.original.length; i++) {
			if (/\S/.test(src.original[i])) {
				if (src.original[i] === '<' && src.original.slice(i).startsWith('</script')) {
					isLast = true;
					// back up 1 character so that the last node isn't on the same line as the script
					newEnd -= 1;
				}
				break;
			}

			if (src.original[i] === '\n') {
				newEnd = i + 1;
			}
		}

		newStart = 0;

		// remove whitespace proceeding the node until the next newline / none whitespace character
		for (let i = start - 1; i > -1; i--) {
			let regex: RegExp;

			// if we are last then we get rid of all whitespace trailing the previous node
			if (isLast) {
				regex = new RegExp(/\S/);
			} else {
				// else we only remove to the new line
				regex = new RegExp(/\S|\n/);
			}

			if (regex.test(src.original[i])) {
				newStart = i + 1;
				break;
			}
		}
	}

	src.update(newStart, newEnd, '');
}
