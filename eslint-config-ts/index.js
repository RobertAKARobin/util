import tsEslint from 'typescript-eslint';

import { default as config, files } from '@robertakarobin/eslint-config';
import localPlugin from './rules/index.js';

// TODO3: Report on `let foo` implicitly being `any`? https://github.com/microsoft/TypeScript/issues/54414

export default tsEslint.config(
	config,

	{
		files,
		languageOptions: {
			parser: tsEslint.parser,
			parserOptions: {
				ecmaFeatures: {
					latest: true,
				},
				projectService: true,
			},
		},
		plugins: {
			'@robertakarobin/ts': localPlugin,
			'@typescript-eslint': tsEslint.plugin,
		},
		rules: {
			'@robertakarobin/ts/member-ordering': `warn`,
			'@robertakarobin/ts/no-partial-with-literal': `warn`,

			'@typescript-eslint/array-type': [`error`, {
				default: `generic`,
			}],
			'@typescript-eslint/await-thenable': `error`,
			'@typescript-eslint/ban-ts-comment': `error`,
			'@typescript-eslint/consistent-type-imports': [`error`, {
				prefer: `type-imports`,
			}],
			'@typescript-eslint/explicit-member-accessibility': [`error`, {
				accessibility: `no-public`,
			}],
			'@typescript-eslint/no-array-constructor': `error`,
			'@typescript-eslint/no-base-to-string': `off`,
			'@typescript-eslint/no-duplicate-enum-values': `error`,
			'@typescript-eslint/no-duplicate-type-constituents': `error`,
			'@typescript-eslint/no-empty-interface': `off`,
			'@typescript-eslint/no-explicit-any': `error`,
			'@typescript-eslint/no-extra-non-null-assertion': `error`,
			'@typescript-eslint/no-floating-promises': `error`,
			'@typescript-eslint/no-for-in-array': `error`,
			'@typescript-eslint/no-implied-eval': `error`,
			'@typescript-eslint/no-inferrable-types': `error`,
			'@typescript-eslint/no-loss-of-precision': `error`,
			'@typescript-eslint/no-misused-new': `error`,
			'@typescript-eslint/no-misused-promises': [`error`, {
				checksVoidReturn: {
					inheritedMethods: false,
				},
			}],
			'@typescript-eslint/no-namespace': `off`,
			'@typescript-eslint/no-non-null-asserted-optional-chain': `error`,
			'@typescript-eslint/no-redundant-type-constituents': `error`,
			'@typescript-eslint/no-this-alias': `off`,
			'@typescript-eslint/no-unnecessary-type-assertion': `warn`,
			'@typescript-eslint/no-unnecessary-type-constraint': `warn`,
			'@typescript-eslint/no-unsafe-argument': `warn`,
			'@typescript-eslint/no-unsafe-assignment': `warn`,
			'@typescript-eslint/no-unsafe-call': `warn`,
			'@typescript-eslint/no-unsafe-declaration-merging': `warn`,
			'@typescript-eslint/no-unsafe-enum-comparison': `warn`,
			'@typescript-eslint/no-unsafe-member-access': `warn`,
			'@typescript-eslint/no-unsafe-return': `error`,
			'@typescript-eslint/no-unused-vars': [`warn`, {
				argsIgnorePattern: `^_`,
				caughtErrorsIgnorePattern: `^_`,
				destructuredArrayIgnorePattern: `^_`,
				ignoreRestSiblings: true,
				varsIgnorePattern: `^_`,
			}],
			'@typescript-eslint/no-var-requires': `error`,
			'@typescript-eslint/prefer-as-const': `error`,
			'@typescript-eslint/require-await': `error`,
			'@typescript-eslint/restrict-plus-operands': `error`,
			'@typescript-eslint/restrict-template-expressions': `off`,
			'@typescript-eslint/sort-type-constituents': [`error`],
			'@typescript-eslint/strict-boolean-expressions': `error`,
			'@typescript-eslint/triple-slash-reference': `error`,
			'@typescript-eslint/unbound-method': [`warn`, {
				ignoreStatic: true,
			}],

			'no-array-constructor': `off`,
			'no-implied-eval': `off`,
			'no-loss-of-precision': `off`,
			'no-restricted-imports': [`error`, {
				patterns: [
					// {
					// 	group: [`../*`],
					// 	message: `Don't use relative paths to import from parent containers. Use TSConfig to set up path aliases instead.`, // Commenting out because it's challenging to resolve path aliases in imported projects. Spent a lot of time with `references:` before giving up
					// },
					// {
					// 	group: [`*.js`],
					// 	message: `Import .ts files, not .js`,
					// },
					{
						group: [`*types.ts`],
						message: `Use .d.ts for Type-only files`,
					},
				],
			}],
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
			'no-unused-vars': `off`,
			'require-await': `off`,
		},
	},

	{
		files: [`**/*.js`],
		rules: {
			'@typescript-eslint/explicit-member-accessibility': `off`,
			'@typescript-eslint/no-var-requires': `off`,
		},
	},
);
