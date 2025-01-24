/**
 * @typedef {import('eslint').Linter.Config} Config
 */

import jsdoc from 'eslint-plugin-jsdoc';

/**
 * @type {Array<Config>}
 */
export default [
	{
		files: [`**/*.js`, `**/*.cjs`, `**/*.mjs`],
		plugins: {
			jsdoc,
		},
		rules: {
			'jsdoc/check-access': `off`,
			'jsdoc/check-alignment': `error`,
			'jsdoc/check-examples': `off`,
			'jsdoc/check-indentation': `error`,
			'jsdoc/check-line-alignment': `error`,
			'jsdoc/check-param-names': `error`,
			'jsdoc/check-property-names': `error`,
			'jsdoc/check-syntax': `error`,
			'jsdoc/check-tag-names': `error`,
			'jsdoc/check-template-names': `error`,
			'jsdoc/check-types': `error`,
			'jsdoc/check-values': `error`,
			'jsdoc/empty-tags': `error`,
			'jsdoc/implements-on-classes': `error`,
			'jsdoc/informative-docs': `error`,
			'jsdoc/match-description': `error`,
			'jsdoc/multiline-blocks': `error`,
			'jsdoc/no-bad-blocks': `error`,
			'jsdoc/no-blank-block-descriptions': `error`,
			'jsdoc/no-defaults': `off`,
			'jsdoc/no-missing-syntax': `off`,
			'jsdoc/no-multi-asterisks': `error`,
			'jsdoc/no-restricted-syntax': `off`,
			'jsdoc/no-types': `off`,
			'jsdoc/no-undefined-types': `error`,
			'jsdoc/require-asterisk-prefix': `error`,
			'jsdoc/require-description': `off`,
			'jsdoc/require-description-complete-sentence': `off`,
			'jsdoc/require-example': `off`,
			'jsdoc/require-file-overview': `off`,
			'jsdoc/require-hyphen-before-param-description': `error`,
			'jsdoc/require-jsdoc': `off`,
			'jsdoc/require-param': `error`,
			'jsdoc/require-param-description': `off`,
			'jsdoc/require-param-name': `error`,
			'jsdoc/require-param-type': `error`,
			'jsdoc/require-property': `error`,
			'jsdoc/require-property-description': `error`,
			'jsdoc/require-property-name': `error`,
			'jsdoc/require-property-type': `error`,
			'jsdoc/require-returns': `off`,
			'jsdoc/require-returns-check': `error`,
			'jsdoc/require-returns-description': `error`,
			'jsdoc/require-returns-type': `error`,
			'jsdoc/require-template': `error`,
			'jsdoc/require-throws': `off`,
			'jsdoc/require-yields': `off`,
			'jsdoc/require-yields-check': `off`,
			'jsdoc/sort-tags': `error`,
			'jsdoc/tag-lines': `error`,
			'jsdoc/valid-types': `error`,
		},
	},
];
