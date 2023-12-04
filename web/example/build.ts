import { Builder } from '@robertakarobin/web/build.ts';

import { Nav } from './src/components/nav.ts';

let nav: string;

class CustomBuilder extends Builder {
	formatBody(doc: Document) {
		nav = new Nav().render(``, true).body.innerHTML;
		return super.formatBody(doc);
	}

	async formatHtml(...[input]: Parameters<Builder[`formatHtml`]>) {
		return await super.formatHtml({
			...input,
			body: `
				<nav>${nav}</nav>
				<main>${input.body}</main>
			`,
		});
	}
}

const builder = new CustomBuilder();

await builder.build({ serve: process.argv.includes(`--serve`) });
