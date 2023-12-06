import { execSync } from 'child_process';

import { Builder } from '@robertakarobin/web/build.ts';

import { Nav } from './src/components/nav.ts';

let nav: string;

class CustomBuilder extends Builder {
	cleanup() {
		try {
			execSync(`npm run lint`, { encoding: `utf8`, stdio: `inherit` });
		} catch (error) {
		}
	}

	formatBody($_root: Element) {
		nav = new Nav().rerender().outerHTML;
		return super.formatBody($_root);
	}

	async formatHtml(...[input]: Parameters<Builder[`formatHtml`]>) {
		const html = await super.formatHtml({
			...input,
			body: `
				<nav>${nav}</nav>
				<main>${input.body}</main>
			`,
		});
		return html;
	}
}

const builder = new CustomBuilder();

await builder.build({ serve: process.argv.includes(`--serve`) });
