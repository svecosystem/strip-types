import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'pathe';
import { strip } from '../src';

// test cases are written under ./cases
// and should include a js.svelte file (stripped) and a ts.svelte file

type Case = {
	name: string;
	ts: string;
	js: string;
};

const cases: Case[] = [];

// build up test cases
const casesDir = './tests/cases';

const dirs = fs.readdirSync(casesDir);

for (const dir of dirs) {
	const casePath = path.join(casesDir, dir);

	const testCase: Case = { name: dir, ts: '', js: '' };

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

cases.forEach((c) => {
	describe(c.name, () => {
		it('Converts ts to js correctly', () => {
			const stripped = strip(c.ts);

			expect(stripped).toBe(c.js);
		});
	});
});
