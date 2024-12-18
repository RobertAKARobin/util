import tsESLint from 'typescript-eslint';

import robinsConfig from '@robertakarobin/eslint-config-ts';

export default tsESLint.config(
	{
		ignores: [
			`**/dist/*`,
			`**/dist-golden/*`,
			`**/node_modules/*`,
			`**/tmp/*`,
			`**/package-lock.json`,
		],
	},

	robinsConfig,

	{
		files: [`*.js`, `*.ts`],
		rules: {
			"no-restricted-imports": [`error`, {
				patterns: [
					{
						group: [`util/*`],
						message: `Paths to util break when this package is imported. Use relative paths instead.`,
					},
				],
			}],
		},
	},
);
