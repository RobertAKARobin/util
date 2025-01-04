import tsESLint from 'typescript-eslint';

import robinsConfig from '@robertakarobin/eslint-config-ts';
import robinsConfigHtml from '@robertakarobin/eslint-config-html';

export default tsESLint.config(
	robinsConfig,

	robinsConfigHtml,

	{
		ignores: [
			`!**/.*.js*`,
			`dist/**/*.js`,
			`dist/**/*.json`,
			`node_modules/**`,
		],
	},
);
