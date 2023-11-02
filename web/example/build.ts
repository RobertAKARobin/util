import CleanCSS from 'clean-css';
import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import pretty from 'pretty';
import { promiseConsecutive } from '@robertakarobin/jsutil';

import { layout, title } from '@robertakarobin/web';

import { resolve, routes } from './routes.ts';

const baseDir = path.join(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(baseDir, `dist`);

fs.rmSync(distDir, { force: true, recursive: true });
fs.mkdirSync(distDir);

const cleanCss = new CleanCSS({ format: `beautify` });
const styles = cleanCss.minify((await import(`./styles.css.ts`)).default).styles;
fs.writeFileSync(path.join(distDir, `styles.css`), styles);

const vendorFile = `/web.js`;
esbuild.buildSync({
	bundle: true,
	entryPoints: [`@robertakarobin/web/index.ts`],
	format: `esm`,
	outfile: path.join(distDir, vendorFile),
});

esbuild.buildSync({
	absWorkingDir: distDir,
	alias: {
		"@robertakarobin/web": vendorFile,
	},
	bundle: true,
	entryPoints: [
		path.join(baseDir, `./script.ts`),
	],
	external: [
		vendorFile,
	],
	format: `iife`,
	outfile: path.join(distDir, `script.js`),
});

await promiseConsecutive(
	Object.keys(routes).map(routeName => async() => {
		const routePath = routes[routeName as keyof typeof routes];
		const contents = await resolve(routePath);
		const template = await layout.last({
			contents,
			routePath,
			title: title.last,
		});
		const compiled = pretty(template, { ocd: true });
		const outName = routePath === `/` ? `index` : routePath;
		const outDir = path.join(distDir, path.dirname(routePath));
		const outPath = path.join(outDir, `${outName}.html`);
		fs.mkdirSync(outDir, { recursive: true });
		fs.writeFileSync(outPath, compiled);
	})
);

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
