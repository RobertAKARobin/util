import { HtmlValidate } from 'html-validate';
import jsBeautify from 'js-beautify';
import path from 'path';

import { Builder, type LayoutArgs } from '@robertakarobin/web/build.ts';

import nav from './src/components/nav.ts';

const trimNewlines = (input: string) => input.trim().replace(/[\n\r]+/g, ``);

const htmlValidate = new HtmlValidate();

class CustomBuilder extends Builder {
	formatCss(contents: string) {
		let css = trimNewlines(contents);
		css = jsBeautify.css(css, {
			end_with_newline: true, // TODO2: Once we're using editorconfig, use the `--editorconfig` option
			indent_with_tabs: true,
		});
		return css;
	}

	formatHtml(input: LayoutArgs) {
		const body = `
			<nav>${nav().template()}</nav>
			<main>${input.body}</main>
		`;
		let html = super.formatHtml({
			...input,
			body,
		});
		html = trimNewlines(html);
		html = jsBeautify.html(html, {
			end_with_newline: true, // TODO2: Once we're using editorconfig, use the `--editorconfig` option
			indent_with_tabs: true,
			unformatted: [`script`],
		});
		const validation = htmlValidate.validateStringSync(html);
		if (!validation.valid) {
			throw new Error(JSON.stringify(validation.results[0].messages, null, `  `));
		}
		return html;
	}
}

const builder = new CustomBuilder({
	baseDirAbs: path.join(process.cwd(), `./web/example`),
});

await builder.build({ serve: process.argv.includes(`--serve`) });
