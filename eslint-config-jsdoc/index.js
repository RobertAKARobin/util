/**
 * @typedef {import('eslint').Linter.Config} Config
 */

import jsdoc from 'eslint-plugin-jsdoc';

/**
 * @type Array<Config>
 */
export default [
	{
		files: [`**/*.js`, `**/*.cjs`, `**/*.mjs`],
		plugins: {
			jsdoc,
		},
		rules: {
			'jsdoc/check-access': `error`,
			'jsdoc/check-alignment': `error`,
			'jsdoc/check-examples': `error`,
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
			'jsdoc/no-defaults': `error`,
			'jsdoc/no-missing-syntax': `error`,
			'jsdoc/no-multi-asterisks': `error`,
			'jsdoc/no-restricted-syntax': `error`,
			'jsdoc/no-types': `error`,
			'jsdoc/no-undefined-types': `error`,
			'jsdoc/require-asterisk-prefix': `error`,
			'jsdoc/require-description': `error`,
			'jsdoc/require-description-complete-sentence': `error`,
			'jsdoc/require-example': `error`,
			'jsdoc/require-file-overview': `error`,
			'jsdoc/require-hyphen-before-param-description': `error`,
			'jsdoc/require-jsdoc': `error`,
			'jsdoc/require-param': `error`,
			'jsdoc/require-param-description': `error`,
			'jsdoc/require-param-name': `error`,
			'jsdoc/require-param-type': `error`,
			'jsdoc/require-property': `error`,
			'jsdoc/require-property-description': `error`,
			'jsdoc/require-property-name': `error`,
			'jsdoc/require-property-type': `error`,
			'jsdoc/require-returns': `error`,
			'jsdoc/require-returns-check': `error`,
			'jsdoc/require-returns-description': `error`,
			'jsdoc/require-returns-type': `error`,
			'jsdoc/require-template': `error`,
			'jsdoc/require-throws': `error`,
			'jsdoc/require-yields': `error`,
			'jsdoc/require-yields-check': `error`,
			'jsdoc/sort-tags': `error`,
			'jsdoc/tag-lines': `error`,
			'jsdoc/valid-types': `error`,
		},
	},
];
