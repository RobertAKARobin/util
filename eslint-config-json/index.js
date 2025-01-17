/**
 * @typedef {import('eslint').Linter.Config} Config
 * @typedef {import('eslint').Linter.RulesRecord} RulesRecord
 */


import json from '@eslint/json';

/**
 * @type {RulesRecord}
 */
const rules = {
	...json.configs.recommended.rules,

	'json/sort-keys': [
		`error`,
		`asc`,
		{
			allowLineSeparatedGroups: true,
			caseSensitive: true,
			natural: true,
		},
	],
};

/**
 * @type {Array<Config>}
 */
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
		rules,
	},

	{
		files: [`**/*.jsonc`],
		language: `json/jsonc`,
		rules,
	},

	{
		files: [`**/*.json5`],
		language: `json/json5`,
		rules,
	},
];
