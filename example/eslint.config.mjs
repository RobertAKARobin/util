import tsESLint from 'typescript-eslint';

import robinsConfig_html from '@robertakarobin/eslint-config-html';
import robinsConfig_ts from '@robertakarobin/eslint-config-ts';

export default tsESLint.config(
	robinsConfig_ts,

	robinsConfig_html,

	{
		ignores: [
			`!**/.*.js*`,
			`dist/**/*.js`,
			`dist/**/*.json`,
			`node_modules/**`,
		],
	},
);
