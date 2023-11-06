// TODO2: Disallow interfaces and enums: https://www.reddit.com/r/typescript/comments/zvpvxz/should_i_use_type_or_interface_whats_the/
module.exports = {
	extends: [
		`plugin:@typescript-eslint/recommended`,
		`@robertakarobin/eslint-config`,
	],
	overrides: [
		{
			files: [`*.js`, `*.cjs`],
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
				"@typescript-eslint/consistent-type-imports": [`error`, {
					prefer: `type-imports`,
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
				"@typescript-eslint/object-curly-spacing": [`error`, `always`],
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
};
