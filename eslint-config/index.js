/**
 * @typedef {import('eslint').Linter.Config} Config
 */

import globals from 'globals';
import stylisticPlugin from '@stylistic/eslint-plugin-js';

import localPlugin from './rules/index.js';

export const files = [`**/*.js`, `**/*.cjs`, `**/*.mjs`, `**/*.ts`];

// TODO1: Add ordering rule for static prop > static method > instance prop (including arrow functions) > instance method
// TODO2: Can't get ESlint to check dotfolders, e.g. `.vscode/settings.json`
// TODO3: Add eslint/js recommended config?
/**
 * @type {Array<Config>}
 */
export default [
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
			'@stylistic': stylisticPlugin,
		},
		rules: {
			'@robertakarobin/import-quotes': [`error`],
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
			'@stylistic/no-multi-spaces': [`error`],
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
			'no-undef': [`error`],
			'no-unused-vars': [`warn`, {
				argsIgnorePattern: `^_`,
				destructuredArrayIgnorePattern: `^_`,
				ignoreRestSiblings: true,
				varsIgnorePattern: `^_`,
			}],
			'sort-imports': [`error`, {
				allowSeparatedGroups: true,
				ignoreCase: true,
			}],
			'sort-keys': [`error`, `asc`, {
				allowLineSeparatedGroups: true,
				caseSensitive: true,
				natural: true,
			}],
		},
	},
];
