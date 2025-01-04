import tsESLint from 'typescript-eslint';

import * as robinsConfig from '@robertakarobin/eslint-config-ts';
import { files } from '@robertakarobin/eslint-config';

export default tsESLint.config(
	robinsConfig.createConfig(),

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
