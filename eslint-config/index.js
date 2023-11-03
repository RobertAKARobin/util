// Not using Prettier because too much of a PITA, especially when supporting .astro files and VSCode
// TODO3: Stylelistic rules are deprecated. Migrate to Prettier when it's less of a PITA: https://typescript-eslint.io/rules/comma-dangle/
// TODO3: Rule for requiring parens around ternaries
// TODO3: Enforce single (double?) quotes on object properties
module.exports = {
	ignorePatterns: [
		`**/dist/*`,
		`!**/.*.json`,
		`**/package-lock.json`,
		`**/node_modules/**`,
	],
	overrides: [
		{
			files: `*.json`,
			rules: {
				"comma-dangle": [`error`, `never`],
				"indent": [`error`, `tab`, {
					SwitchCase: 1,
				}],
				"max-len": `off`,
				"quote-props": [`error`, `consistent`],
				"quotes": [`error`, `double`],
				"semi": `off`,
			},
		},
	],
	plugins: [
		`eslint-plugin-import`,
		`eslint-plugin-import-newlines`,
		`eslint-plugin-import-quotes`,
	],
	rules: {
		"arrow-parens": [`error`, `as-needed`],
		"arrow-spacing": `error`,
		"brace-style": [`error`, `1tbs`],
		"comma-dangle": [`error`, `always-multiline`],
		"curly": [`error`, `all`],
		"import-newlines/enforce": [`error`, {
			items: 4,
		}],
		"import-quotes/import-quotes": [`error`, `single`],
		"import/extensions": [`error`, `ignorePackages`],
		"indent": [`error`, `tab`, {
			SwitchCase: 1,
			ignoredNodes: [`TemplateLiteral *`],
		}],
		"key-spacing": [`error`, {
			afterColon: true,
			beforeColon: false,
			mode: `strict`,
		}],
		"max-len": [`warn`, {
			code: 100,
			ignoreComments: true,
			ignoreRegExpLiterals: false,
			ignoreStrings: false,
			ignoreTemplateLiterals: true,
		}],
		"no-unused-vars": [`warn`, {
			argsIgnorePattern: `^_`,
		}],
		"object-curly-spacing": [`error`, `always`],
		"object-property-newline": [`error`, {
			allowAllPropertiesOnSameLine: true,
		}],
		"quote-props": [`error`, `consistent-as-needed`],
		"quotes": [`error`, `backtick`],
		"semi": [`error`, `always`],
		"sort-imports": [`error`, {
			allowSeparatedGroups: true,
			ignoreCase: true,
		}],
		"sort-keys": [`error`, `asc`, {
			allowLineSeparatedGroups: true,
		}],
		"space-before-blocks": [`error`, `always`],
		"space-in-parens": [`error`],
		"space-infix-ops": [`error`],
	},
};
