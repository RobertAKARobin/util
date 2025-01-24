import tsESLint from 'typescript-eslint';

import { files } from '@robertakarobin/eslint-config';
import robinsConfig_jsdoc from '@robertakarobin/eslint-config-jsdoc';
import robinsConfig_json from '@robertakarobin/eslint-config-json';
import robinsConfig_ts from '@robertakarobin/eslint-config-ts';

export default tsESLint.config(
	robinsConfig_jsdoc,
	robinsConfig_json,
	robinsConfig_ts,

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
