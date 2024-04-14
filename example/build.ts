import { execSync } from 'child_process';
import jsBeautify from 'js-beautify';

import { Builder } from '@robertakarobin/util/components/build.ts';

import { routes } from '@src/routes.ts';

class CustomBuilder extends Builder {
	cleanup() {
		try {
			execSync(`npm run lint`, { encoding: `utf8`, stdio: `inherit` });
		} catch (error) {
		}
	}

	async formatCss(input: string) {
		let css = await super.formatCss(input);
		css = jsBeautify.css(css, {
			end_with_newline: true,
			indent_with_tabs: true,
			space_around_combinator: true,
			space_around_selector_separator: true,
		});
		return css;
	}

	async formatHtml(input: string) {
		let html = await super.formatHtml(input);
		html = jsBeautify.html(html, {
			end_with_newline: true,
			indent_with_tabs: true,
			unformatted: [`script`],
		});
		return html;
	}
}

const ssgRoutesByName: Record<string, string> = { ...routes };
delete ssgRoutesByName[`ssgNo`];
const ssgRoutes = Object.values(ssgRoutesByName);

const builder = new CustomBuilder({
	esbuild: {
		minify: false,
	},
	esbuildServe: {
		fallback: `dist/index.html`,
	},
	metaFileRel: `./meta.json`,
	ssgRoutes,
});

await builder.build({ serve: process.argv.includes(`--serve`) });
