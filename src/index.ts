import { parse, AST } from 'svelte/compiler';
import { walk } from 'estree-walker';
import MagicString from 'magic-string';

export function strip(source: string): string {
	const ast = parse(source);

	// console.log(ast);

	const src = new MagicString(source);

	const enterScript = (node: AST.BaseNode) => {
        console.log(node)

		if (node.type === 'Script') {
			const scriptDeclaration = src.toString().slice(node.start, node.content.start);

			const langIndex = scriptDeclaration.search(/ lang=["|']ts["|']/g);

			if (langIndex !== -1) {
				src.update(node.start + langIndex, node.start + langIndex + 10, '');
			}
		}

        const tsNodes = ['TSTypeParameterInstantiation', 'TSTypeAnnotation', 'TSTypeAliasDeclaration'];

		if (tsNodes.includes(node.type)) {
			src.update(node.start, node.end, '');
		}

        if (node.type === "ImportDeclaration" && node.importKind === "type") {
            src.update(node.start, node.end, '');
        }
	};

	walk(ast.instance, { enter: enterScript });

	walk(ast.module, { enter: enterScript });

	return src.toString();
}
