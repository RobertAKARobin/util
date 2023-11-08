import { fileURLToPath } from 'url';
import jsBeautify from 'js-beautify';
import path from 'path';

import { build, type BuildOptions, watchAndServe } from '@robertakarobin/web/build.ts';

import { resolve, routes } from './src/routes.ts';
import layout from './src/pages/_layout.ts';

const basedir = path.dirname(fileURLToPath(import.meta.url));

const trimFile = (input: string) => input.trim().replace(/[\n\r]+/g, ``);

const formatCss = (contents: string) => jsBeautify.css(
	trimFile(contents),
	{
		end_with_newline: true, // TODO2: Once we're using editorconfig, use the `--editorconfig` option
		indent_with_tabs: true,
	}
);

const formatHtml = (contents: string) => jsBeautify.html(
	trimFile(contents),
	{
		end_with_newline: true, // TODO2: Once we're using editorconfig, use the `--editorconfig` option
		indent_with_tabs: true,
	}
);

const options: BuildOptions<typeof routes> = {
	basedir,
	formatCss,
	formatHtml,
	layout,
	resolve,
	routes,
};

if (process.argv.includes(`--watch`)) {
	watchAndServe(options);
} else {
	await build(options);
}
