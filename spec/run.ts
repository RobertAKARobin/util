/*
export class SpecError extends Error {}

const resultTypes = [`error`, `fail`, `pass`, `skip`] as const;

const testOptionDefaults = {
	indent: `\t` as string,
	randomize: false as boolean,
} as const;

type TestOptions = typeof testOptionDefaults;

const symbols: Record<typeof resultTypes[number], string> = {
	error: `🟡`,
	fail: `🔴`,
	pass: `🟢`,
	skip: `⚪`,
} as const;
*/

import * as path from 'path';

import $ from '.';

void (async function() {
	const filePaths = process.argv.slice(2);

	await Promise.all(
		filePaths.map((filePath) => {
			return import(path.join(process.env.PWD, filePath));
		})
	);

	// await $.run();
	// console.log($.log());
	console.log(JSON.stringify($._rootSuite.children, null, `\t`));
})();
