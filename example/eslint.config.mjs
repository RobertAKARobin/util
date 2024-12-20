import tsESLint from 'typescript-eslint';

import * as robinsConfig from '@robertakarobin/eslint-config-ts';
import robinsConfigHtml from '@robertakarobin/eslint-config-html';

export default tsESLint.config(
	robinsConfig.createConfig({
		filesNotInTsconfig: [`eslint.config.mjs`],
	}),

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
