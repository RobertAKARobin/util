import { Builder } from '@robertakarobin/web/build.ts';

import { nav } from './src/components/nav.ts';

class CustomBuilder extends Builder {
	async formatHtml(...[input]: Parameters<Builder[`formatHtml`]>) {
		return await super.formatHtml({
			...input,
			body: `
				<nav>${nav()}</nav>
				<main>${input.body}</main>
			`,
		});
	}
}

const builder = new CustomBuilder();

await builder.build({ serve: process.argv.includes(`--serve`) });
