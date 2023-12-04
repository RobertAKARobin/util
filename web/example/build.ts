import { Builder } from '@robertakarobin/web/build.ts';

import { Nav } from './src/components/nav.ts';

let nav: string;

class CustomBuilder extends Builder {
	formatBody($_root: Element) {
		nav = new Nav().rerender().outerHTML;
		return super.formatBody($_root);
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
