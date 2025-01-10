/**
 * @typedef {import('eslint').Linter.RuleEntry} RuleEntry
 * TODO2: Why is this required by TS?
 */

import json from '@eslint/json';

const rules_shared = {
	...json.configs.recommended,

	rules: {
		...json.configs.recommended.rules,

		'json/sort-keys': /** @type {RuleEntry} **/([
			`error`,
			`asc`,
			{
				allowLineSeparatedGroups: true,
				caseSensitive: false,
				natural: true,
			},
		]),
	},
};

export default [
	{
		plugins: {
			json,
		},
	},

	{
		files: [`**/*.json`],
		ignores: [
			`package-lock.json`,
			`**/package-lock.json`,
		],
		language: `json/json`,
		...rules_shared,
	},

	{
		files: [`**/*.jsonc`],
		language: `json/jsonc`,
		...rules_shared,
	},

	{
		files: [`**/*.json5`],
		language: `json/json5`,
		...rules_shared,
	},
];
