/**
 * @import { ExecUntilResult } from './execUntil.js';
 */

import { suite, test } from '../spec/index.js';

import { execUntil, execUntilSame } from './execUntil.js';

export const spec = suite(import.meta.url, {},
	test(`execUntil`, async $ => {
		let attempt = 0;
		let command = execUntil(`foo`, state => (attempt = state.attempt) >= 9);

		$.assert(x => x(attempt) === 0);
		let result = await command;

		$.assert(x => x(attempt) === 9);
		$.assert(() => result.error instanceof Error);

		result = await execUntil(({ attempt }) => `printf ${attempt}`, ({ previous }) => previous?.stdout === `2`);
		$.assert(x => x(result.stdout) === `3`);
	}),

	test(`execUntilSame`, async $ => {
		/**
		 * @type {ExecUntilResult | undefined}
		 */
		let previous;
		let attempt = 0;
		const commands = [
			`aaa`,
			`bbb`,
			`ccc`,
			`ccc`,
			`ddd`,
		];
		const result = await execUntilSame(state => {
			previous = state.previous;
			return commands[attempt++];
		});
		$.assert(x => x(attempt) === 4);
		$.assert(x => x(result.error?.message) === x(previous?.error?.message));
	}),
);
