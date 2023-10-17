// Not using Prettier because too much of a PITA, especially when supporting .astro files and VSCode
// TODO3: Stylelistic rules are deprecated. Migrate to Prettier when it's less of a PITA: https://typescript-eslint.io/rules/comma-dangle/
// TODO3: Rule for requiring parens around ternaries
// TODO2: Disallow interfaces and enums: https://www.reddit.com/r/typescript/comments/zvpvxz/should_i_use_type_or_interface_whats_the/
module.exports = {
	extends: [
		`plugin:@typescript-eslint/recommended`,
	],
	ignorePatterns: [
		`dist/**`,
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
				"quote-props": [`error`, `consistent`],
				"quotes": [`error`, `double`],
				"semi": `off`,
			},
		},
		{
			files: `*.js`,
			rules: {
				"@typescript-eslint/explicit-member-accessibility": `off`,
				"@typescript-eslint/no-var-requires": `off`,
			},
		},
		{
			extends: [
				`plugin:@typescript-eslint/recommended-type-checked`,
			],
			files: [`*.ts`, `*.tsx`],
			parser: `@typescript-eslint/parser`,
			parserOptions: {
				project: true,
			},
			rules: {
				"@typescript-eslint/array-type": [`error`, {
					default: `generic`,
				}],
				"@typescript-eslint/explicit-member-accessibility": [`error`, {
					accessibility: `no-public`,
				}],
				"@typescript-eslint/member-delimiter-style": [`error`, {
					singleline: {
						requireLast: true,
					},
				}],
				"@typescript-eslint/member-ordering": [`error`, {
					default: {
						memberTypes: [
							`signature`,
							`call-signature`,

							[`static-field`, `static-get`, `static-set`],
							`static-initialization`,
							`static-method`,

							[
								`abstract-field`,
								`abstract-get`,
								`abstract-set`,
								`instance-field`,
								`instance-get`,
								`instance-set`,
							],
							`constructor`,
							[`abstract-method`, `instance-method`],
						],
						order: `natural-case-insensitive`,
					},
				}],
				"@typescript-eslint/no-empty-interface": `off`,
				"@typescript-eslint/no-explicit-any": `error`,
				"@typescript-eslint/no-unnecessary-type-assertion": `warn`,
				"@typescript-eslint/no-unsafe-argument": `warn`,
				"@typescript-eslint/no-unsafe-assignment": `warn`,
				"@typescript-eslint/no-unsafe-call": `warn`,
				"@typescript-eslint/no-unsafe-member-access": `warn`,
				"@typescript-eslint/no-unused-vars": [`warn`, {
					argsIgnorePattern: `^_`,
				}],
				"@typescript-eslint/semi": [`error`, `always`],
				"@typescript-eslint/space-before-function-paren": [`error`, `never`],
				"@typescript-eslint/unbound-method": [`warn`, {
					ignoreStatic: true,
				}],
				"typescript-sort-keys/interface": `error`,
				"typescript-sort-keys/string-enum": `error`,
			},
		},
	],
	plugins: [
		`@typescript-eslint`,
		`typescript-sort-keys`,
	],
	rules: {
		"comma-dangle": [`error`, `always-multiline`],
		"curly": [`error`, `all`],
		"indent": [`error`, `tab`, {
			SwitchCase: 1,
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
		}],
		"sort-keys": [`error`, `asc`, {
			allowLineSeparatedGroups: true,
		}],
		"space-before-blocks": [`error`, `always`],
		"space-in-parens": [`error`],
		"space-infix-ops": [`error`],
	},
};
