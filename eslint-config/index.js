/**
 * @typedef {import('eslint').Linter.Config} Config
 */

import globals from 'globals';
// @ts-expect-error TODO2 Types are incoming https://github.com/import-js/eslint-plugin-import/pull/3097
import importPlugin from 'eslint-plugin-import';
// @ts-expect-error TODO1 Minor package, copy it
import importQuotesPlugin from 'eslint-plugin-import-quotes';
import stylisticPlugin from '@stylistic/eslint-plugin-js';

import localPlugin from './rules/index.js';

export const files = [`**/*.js`, `**/*.cjs`, `**/*.mjs`, `**/*.ts`];

// TODO2: Can't get ESlint to check dotfolders, e.g. `.vscode/settings.json`
/**
 * @type Array<Config>
 */
export const config = [
	// { TODO1: Extract to json package
	// 	files: [`*.json`],
	// 	ignores: [
	// 		`!**/*.json`,
	// 		`**/package-lock.json`,
	// 	],
	// 	plugins: {
	// 		'@stylistic': stylisticPlugin,
	// 	},
	// 	rules: {
	// 		'@stylistic/comma-dangle': [`error`, `never`],
	// 		'@stylistic/indent': [`error`, `tab`],
	// 		'@stylistic/max-len': `off`,
	// 		'@stylistic/quote-props': [`error`, `consistent`],
	// 		'@stylistic/quotes': [`error`, `double`],
	// 		'@stylistic/semi': `off`,
	// 	},
	// },

	{
		ignores: [
			`**/node_modules/*`,
		],
	},

	{
		files,
		languageOptions: {
			globals: { // Needed for eslint `no-undef`. Would be more explicit to go through each file and explicitly declare which environment-dependent variables are needed, but (a) that's a lot of work, and (b) if we try to use a variable in the wrong environment then that should be caught when running tests
				...globals.browser,
				...globals.node,
			},
		},
		plugins: {
			'@robertakarobin': localPlugin,
			// @ts-expect-error TODO3 Tracking in https://github.com/eslint-stylistic/eslint-stylistic/issues/437
			'@stylistic': stylisticPlugin,
			'import': importPlugin, // TODO2: These throw a @typescript-eslint/no-unsafe-assignment warning
			'import-quotes': importQuotesPlugin,
		},
		rules: {
			'@robertakarobin/no-bang-negation': [`warn`],
			'@stylistic/arrow-parens': [`error`, `as-needed`],
			'@stylistic/arrow-spacing': `error`,
			'@stylistic/brace-style': [`error`, `1tbs`],
			'@stylistic/comma-dangle': [`error`, `always-multiline`],
			'@stylistic/comma-spacing': [`error`],
			'@stylistic/indent': [`error`, `tab`, {
				SwitchCase: 1,
				ignoredNodes: [`TemplateLiteral *`],
			}],
			'@stylistic/key-spacing': [`error`, {
				afterColon: true,
				beforeColon: false,
				mode: `strict`,
			}],
			'@stylistic/keyword-spacing': [`error`],
			'@stylistic/max-len': [`warn`, {
				code: 100,
				ignoreComments: true,
				ignoreRegExpLiterals: false,
				ignoreStrings: false,
				ignoreTemplateLiterals: true,
			}],
			'@stylistic/object-curly-spacing': [`error`, `always`],
			'@stylistic/object-property-newline': [`error`, {
				allowAllPropertiesOnSameLine: true,
			}],
			'@stylistic/quote-props': [`error`, `consistent-as-needed`],
			'@stylistic/quotes': [`error`, `backtick`],
			'@stylistic/semi': [`error`, `always`],
			'@stylistic/space-before-blocks': [`error`, `always`],
			'@stylistic/space-in-parens': [`error`],
			'@stylistic/space-infix-ops': [`error`],

			'curly': [`error`, `all`],
			'eqeqeq': `error`,
			'import-quotes/import-quotes': [`error`, `single`],
			'import/extensions': [`error`, `ignorePackages`],
			'no-undef': [`error`],
			'no-unused-vars': [`warn`, {
				argsIgnorePattern: `^_`,
				destructuredArrayIgnorePattern: `^_`,
				ignoreRestSiblings: true,
				varsIgnorePattern: `^_`,
			}],
			'prefer-spread': `off`,
			'sort-imports': [`error`, {
				allowSeparatedGroups: true,
				ignoreCase: true,
			}],
			'sort-keys': [`error`, `asc`, {
				allowLineSeparatedGroups: true,
			}],
		},
	},
];

export default config;
