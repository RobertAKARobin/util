import tsESLint from 'typescript-eslint';

import robinsConfig_jsdoc from '@robertakarobin/eslint-config-jsdoc';
import robinsConfig_json from '@robertakarobin/eslint-config-json';
import robinsConfig_ts from '@robertakarobin/eslint-config-ts';

import tsConfig from './tsconfig.json' with { type: 'json' };

const requireRelative = {
	group: [`util/*`],
	message: `Paths to util break when this package is imported. Use relative paths instead.`,
};

export default tsESLint.config(
	robinsConfig_jsdoc,
	robinsConfig_json,
	robinsConfig_ts,

	{
		files: [`**/*.js`, `**/*.cjs`, `**/*.mjs`],
		rules: {
			"no-restricted-imports": [`error`, {
				patterns: [
					requireRelative,
					{
						message: `Specify a file extension for relative imports.`,
						regex: `^\\..*(?<!\\.js|\\.json)$`,
					},
				],
			}],
		},
	},

	{
		files: [`**/.*ts`],
		rules: {
			"no-restricted-imports": [`error`, {
				patterns: [
					requireRelative,
				],
			}],
		},
	},

	{
		ignores: [
			`**/dist/*`,
			`**/dist-golden/*`,
			...tsConfig.exclude,
		],
	},
);
