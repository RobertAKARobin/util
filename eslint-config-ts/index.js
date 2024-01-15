module.exports = {
	extends: [
		`plugin:@typescript-eslint/recommended`,
		`@robertakarobin/eslint-config`,
	],
	overrides: [
		{
			files: [`*.js`, `*.cjs`],
			rules: {
				'@typescript-eslint/explicit-member-accessibility': `off`,
				'@typescript-eslint/no-var-requires': `off`,
			},
		},
		{
			extends: [
				`plugin:@typescript-eslint/recommended-type-checked`,
			],
			files: [`*.ts`, `*.tsx`, `*.d.ts`],
			parser: `@typescript-eslint/parser`,
			parserOptions: {
				project: true,
			},
			rules: {
				'@typescript-eslint/array-type': [`error`, {
					default: `generic`,
				}],
				'@typescript-eslint/ban-types': [`error`, {
					types: {
						Function: false,
					},
				}],
				'@typescript-eslint/consistent-type-imports': [`error`, {
					prefer: `type-imports`,
				}],
				'@typescript-eslint/explicit-member-accessibility': [`error`, {
					accessibility: `no-public`,
				}],
				'@typescript-eslint/member-delimiter-style': [`error`, {
					singleline: {
						requireLast: true,
					},
				}],
				'@typescript-eslint/member-ordering': [`error`, {
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
				'@typescript-eslint/no-base-to-string': [`off`],
				'@typescript-eslint/no-empty-interface': `off`,
				'@typescript-eslint/no-explicit-any': `error`,
				'@typescript-eslint/no-namespace': `off`,
				'@typescript-eslint/no-this-alias': `off`,
				'@typescript-eslint/no-unnecessary-type-assertion': `warn`,
				'@typescript-eslint/no-unsafe-argument': `warn`,
				'@typescript-eslint/no-unsafe-assignment': `warn`,
				'@typescript-eslint/no-unsafe-call': `warn`,
				'@typescript-eslint/no-unsafe-member-access': `warn`,
				'@typescript-eslint/no-unused-vars': [`warn`, {
					argsIgnorePattern: `^_`,
				}],
				'@typescript-eslint/object-curly-spacing': [`error`, `always`],
				'@typescript-eslint/restrict-template-expressions': `off`,
				'@typescript-eslint/semi': [`error`, `always`],
				'@typescript-eslint/space-before-function-paren': [`error`, `never`],
				'@typescript-eslint/strict-boolean-expressions': `error`,
				'@typescript-eslint/unbound-method': [`warn`, {
					ignoreStatic: true,
				}],
				// 'no-restricted-imports': [`error`, {
				// 	patterns: [
				// 		{
				// 			group: [`../*`],
				// 			message: `Don't use relative paths to import from parent containers. Use TSConfig to set up path aliases instead.`, // Commenting out because it's challenging to resolve path aliases in imported projects. Spent a lot of time with `references:` before giving up
				// 		},
				// 	],
				// }],
				'no-restricted-syntax': [
					`warn`,
					{
						message: `Don't use enums; use 'const' instead`,
						selector: `TSEnumDeclaration`,
					},
					{
						message: `Use a type. In modern TS types can do almost everything interfaces can.`,
						selector: `TSInterfaceDeclaration`,
					},
				],
				'typescript-sort-keys/interface': `error`,
				'typescript-sort-keys/string-enum': `error`,

			},
		},
	],
	plugins: [
		`@typescript-eslint`,
		`typescript-sort-keys`,
	],
};
