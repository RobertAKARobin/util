import path from 'path';

import { BuilderWithValidation } from '@robertakarobin/web/build-validate.ts';

import nav from './src/components/nav.ts';

class CustomBuilder extends BuilderWithValidation {
	async formatHtml(...[input]: Parameters<BuilderWithValidation[`formatHtml`]>) {
		return await super.formatHtml({
			...input,
			body: `
				<nav>${nav()}</nav>
				<main>${input.body}</main>
			`,
		});
	}
}

const builder = new CustomBuilder({
	baseDirAbs: path.join(process.cwd(), `./web/example`),
});

await builder.build({ serve: process.argv.includes(`--serve`) });
