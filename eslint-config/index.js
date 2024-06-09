// TODO2: Can't get ESlint to check dotfolders, e.g. `.vscode/settings.json`
// TODO3: Upgrade to eslint@^9 when this is resolved: https://github.com/import-js/eslint-plugin-import/issues/2948
// TODO3: vscode-eslint throws 'Could not find config file. at locateConfigFileToUse' on this, but `npx eslint` works fine
module.exports = {
	ignorePatterns: [
		`!**/.*.js*`,
		`**/package-lock.json`,
		`**/node_modules/**`,
	],
	overrides: [
		{
			files: `*.html`,
			parser: `@html-eslint/parser`,
			rules: {
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
				'@html-eslint/sort-attrs': `error`,
				'@stylistic/max-len': `off`,
			},
		},
		{
			files: `*.json`,
			rules: {
				'@stylistic/comma-dangle': [`error`, `never`],
				'@stylistic/indent': [`error`, `tab`],
				'@stylistic/max-len': `off`,
				'@stylistic/quote-props': [`error`, `consistent`],
				'@stylistic/quotes': [`error`, `double`],
				'@stylistic/semi': `off`,
			},
		},
	],
	plugins: [
		`@stylistic`,
		`eslint-plugin-import`,
		`eslint-plugin-import-quotes`,
		`@html-eslint`,
	],
	rules: {
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
};
