import fs from 'node:fs';
import path from 'pathe';
import { describe, expect, it } from 'vitest';
import { strip } from '../src';
import { normalizeNewlines } from './utils';

// test cases are written under ./cases
// and should include a js.svelte file (stripped) and a ts.svelte file
// IMPORTANT: If you fail to provide a .js file then vitest will expect an error

type Case = {
	name: string;
	ts: string;
	/** If left out vitest will expect an error */
	js: string | null;
};

const cases: Case[] = [];

// build up test cases
const casesDir = './tests/cases';

const dirs = fs.readdirSync(casesDir);

for (const dir of dirs) {
	const casePath = path.join(casesDir, dir);

	const testCase: Case = { name: dir, ts: '', js: null };

	const files = fs.readdirSync(casePath);

	for (const file of files) {
		if (file === 'js.svelte') {
			testCase.js = fs.readFileSync(path.join(casePath, file)).toString();
		} else if (file === 'ts.svelte') {
			testCase.ts = fs.readFileSync(path.join(casePath, file)).toString();
		}
	}

	cases.push(testCase);
}

for (const c of cases) {
	describe(c.name, () => {
		it('Converts ts to js correctly', () => {
			if (c.js) {
				const stripped = strip(c.ts);

				expect(normalizeNewlines(stripped)).toBe(normalizeNewlines(c.js));
			} else {
				// if c.js not provided then we expect an error
				expect(() => strip(c.ts)).toThrow();
			}
		});
	});
}
