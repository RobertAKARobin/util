import tsESLint from 'typescript-eslint';

import { files } from '@robertakarobin/eslint-config';
import robinsConfig from '@robertakarobin/eslint-config-ts';

export default tsESLint.config(
	robinsConfig,

	{
		files,
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

	{
		ignores: [
			`**/dist/*`,
			`**/dist-golden/*`,
			`**/tmp/*`,
			`example/`,
		],
	},
);
