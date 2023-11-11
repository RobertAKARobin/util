import jsBeautify from 'js-beautify';
import path from 'path';

import { Builder } from '@robertakarobin/web/build.ts';

import { type routes } from './src/routes.ts';

const trimNewlines = (input: string) => input.trim().replace(/[\n\r]+/g, ``);

class CustomBuilder extends Builder<typeof routes> {
	formatCss(contents: string) {
		let css = trimNewlines(contents);
		css = jsBeautify.css(css, {
			end_with_newline: true, // TODO2: Once we're using editorconfig, use the `--editorconfig` option
			indent_with_tabs: true,
		});
		return css;
	}

	formatHtml(contents: string) {
		let html = super.formatHtml(contents);
		html = trimNewlines(html);
		html = jsBeautify.html(html, {
			end_with_newline: true, // TODO2: Once we're using editorconfig, use the `--editorconfig` option
			indent_with_tabs: true,
		});
		return html;
	}
}

const builder = new CustomBuilder({
	baseDirAbs: path.join(process.cwd(), `./web/example`),
});

if (process.argv.includes(`--serve`)) {
	await builder.serve({ watch: true });
} else {
	await builder.build();
}
