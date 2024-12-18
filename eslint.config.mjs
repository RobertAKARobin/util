import globals from 'globals';
import tsESLint from 'typescript-eslint';

import { files } from '@robertakarobin/eslint-config';
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
		files,
		languageOptions: {
			globals: { // Needed for eslint `no-undef`. Would be more explicit to go through each file and explicitly declare which environment-dependent variables are needed, but (a) that's a lot of work, and (b) if we try to use a variable in the wrong environment then that should be caught when running tests
				...globals.browser,
				...globals.node,
			},
		},
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
