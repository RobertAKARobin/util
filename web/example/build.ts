import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import fs from 'fs';
import jsBeautify from 'js-beautify';
import path from 'path';

import { Page, type RoutePath } from '@robertakarobin/web/index.ts';
import { getBuildOptions } from '@robertakarobin/web/build.ts';

import { resolve, routes } from './routes.ts';
import layout from './pages/_layout.ts';

const trimFile = (input: string) => input.trim().replace(/[\n\r]+/g, ``);

const baseDir = path.join(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(baseDir, `dist`);

fs.rmSync(distDir, { force: true, recursive: true });
fs.mkdirSync(distDir);

const styles = jsBeautify.css(
	trimFile((await import(`./styles.css.ts`)).default),
	{
		end_with_newline: true, // TODO2: Once we're using editorconfig, use the `--editorconfig` option
		indent_with_tabs: true,
	}
);
fs.writeFileSync(path.join(distDir, `styles.css`), styles);

const vendorFile = `/web.js`;
esbuild.buildSync({
	bundle: true,
	entryPoints: [`@robertakarobin/web/index.ts`],
	format: `esm`,
	outfile: path.join(distDir, vendorFile),
});

const formatHtml = (contents: string) => jsBeautify.html(trimFile(contents), {
	end_with_newline: true, // TODO2: Once we're using editorconfig, use the `--editorconfig` option
	indent_with_tabs: true,
});

const resolveStatic = async(path: RoutePath) => {
	const contents = await resolve(path as string);
	if (!contents) {
		throw new Error(`Template not found for path ${path as string}`);
	}
	if (path === routes.bundled || path === routes.split) {
		return;
	}
	return layout(Page.title.last, contents);
};

const buildOptions = await getBuildOptions({
	baseDir,
	distDir,
	formatHtml,
	resolve: resolveStatic,
	routes,
});

await esbuild.build({
	absWorkingDir: distDir,
	alias: {
		"@robertakarobin/web/index.ts": vendorFile,
	},
	bundle: true,
	entryPoints: [
		{ in: path.join(baseDir, `./script.ts`), out: `script` },
		...buildOptions.entryPoints,
	],
	external: [
		vendorFile,
	],
	format: `esm`,
	outdir: distDir,
	plugins: [
		...buildOptions.plugins,
	],
});

if (process.argv.includes(`--serve`)) {
	const port = 3000;
	void retryPort();
	async function retryPort() {
		(await esbuild.context({})).serve({
			port,
			servedir: distDir,
		}).then(() => {
			console.log(`Serving at http://localhost:${port}`);
		}).catch(() => {
			void retryPort();
		});
	}
}
