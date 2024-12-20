import htmlEslintParser from '@html-eslint/parser';
import htmlEslintPlugin from '@html-eslint/eslint-plugin';

// TODO3: Lint HTML in JS template literals (https://github.com/yeonjuan/html-eslint/issues/196)
export const config = [
	{
		files: [`**/*.html`],
		languageOptions: {
			parser: htmlEslintParser,
		},
		plugins: {
			'@html-eslint': htmlEslintPlugin,
		},
		rules: {
			'@html-eslint/attrs-newline': [`error`, {
				closeStyle: `newline`,
				ifAttrsMoreThan: 2,
			}],
			'@html-eslint/element-newline': [`error`, {
				skip: [
					`a`,
					`abbr`,
					`acronym`,
					`b`,
					`br`,
					`cite`,
					`code`,
					`del`,
					`dfn`,
					`em`,
					`i`,
					`img`,
					`kbd`,
					`mark`,
					`q`,
					`samp`,
					`span`,
					`strong`,
					`sub`,
					`sup`,
					`time`,
					`u`,
					`s`,
					`slot`,
					`td`,
					`var`,
				],
			}],
			'@html-eslint/indent': [`error`, `tab`],
			'@html-eslint/lowercase': `error`,
			'@html-eslint/no-abstract-roles': `error`,
			'@html-eslint/no-accesskey-attrs': `error`,
			'@html-eslint/no-aria-hidden-body': `error`,
			'@html-eslint/no-duplicate-attrs': `error`,
			'@html-eslint/no-duplicate-id': `error`,
			'@html-eslint/no-extra-spacing-attrs': [`error`, {
				disallowMissing: true,
				disallowTabs: true,
				enforceBeforeSelfClose: true,
			}],
			'@html-eslint/no-inline-styles': `off`,
			'@html-eslint/no-multiple-empty-lines': [`error`, {
				max: 2,
			}],
			'@html-eslint/no-multiple-h1': `warn`,
			'@html-eslint/no-non-scalable-viewport': `warn`,
			'@html-eslint/no-obsolete-tags': `error`,
			'@html-eslint/no-positive-tabindex': `warn`,
			'@html-eslint/no-script-style-type': `error`,
			'@html-eslint/no-skip-heading-levels': `warn`,
			'@html-eslint/no-target-blank': `error`,
			'@html-eslint/no-trailing-spaces': `error`,
			'@html-eslint/quotes': [`error`, `double`],
			'@html-eslint/require-button-type': `error`,
			'@html-eslint/require-closing-tags': [`error`, {
				selfClosing: `always`,
			}],
			'@html-eslint/require-doctype': `error`,
			'@html-eslint/require-frame-title': `error`,
			'@html-eslint/require-img-alt': `error`,
			'@html-eslint/require-lang': `error`,
			'@html-eslint/require-li-container': `error`,
			'@html-eslint/require-meta-charset': `warn`,
			'@html-eslint/require-meta-description': `warn`,
			'@html-eslint/require-meta-viewport': `warn`,
			'@html-eslint/require-title': `error`,
			'@html-eslint/sort-attrs': [`error`, {
				priority: [],
			}],
		},
	},
];

export default config;
