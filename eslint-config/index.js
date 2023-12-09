module.exports = {
	ignorePatterns: [
		`**/dist/*`,
		`!**/.*.js*`,
		`**/package-lock.json`,
		`**/node_modules/**`,
	],
	overrides: [
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
		`eslint-plugin-import-newlines`,
		`eslint-plugin-import-quotes`,
	],
	rules: {
		'@stylistic/arrow-parens': [`error`, `as-needed`],
		'@stylistic/arrow-spacing': `error`,
		'@stylistic/brace-style': [`error`, `1tbs`],
		'@stylistic/comma-dangle': [`error`, `always-multiline`],
		'@stylistic/key-spacing': [`error`, {
			afterColon: true,
			beforeColon: false,
			mode: `strict`,
		}],
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
		'import-newlines/enforce': [`error`, {
			items: 4,
		}],
		'import-quotes/import-quotes': [`error`, `single`],
		'import/extensions': [`error`, `ignorePackages`],
		'indent': [`error`, `tab`, {
			SwitchCase: 1,
			ignoredNodes: [`TemplateLiteral *`],
		}],
		'no-unused-vars': [`warn`, {
			argsIgnorePattern: `^_`,
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
