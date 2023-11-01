import CleanCSS from 'clean-css';
import esbuild from 'esbuild';
import fs from 'fs';
import pretty from 'pretty';

// import type * as Type from '@robertakarobin/web/types.d.ts';
// import { build } from '@robertakarobin/web/build.ts';
import { fileURLToPath } from 'url';
import path from 'path';

import { resolve, routes } from './routes.ts';

const baseDir = path.join(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(baseDir, `dist`);

fs.rmSync(distDir, { force: true, recursive: true });
fs.mkdirSync(distDir);

const cleanCss = new CleanCSS({ format: `beautify` });
const styles = cleanCss.minify((await import(`./styles.css.ts`)).default).styles;
fs.writeFileSync(path.join(distDir, `styles.css`), styles);

esbuild.buildSync({
	bundle: true,
	entryPoints: [`@robertakarobin/web/index.ts`],
	format: `esm`,
	outfile: path.join(distDir, `web.js`),
});

esbuild.buildSync({
	alias: {
		"@robertakarobin/web": path.join(distDir, `/web.js`),
	},
	bundle: true,
	entryPoints: [
		path.join(baseDir, `./script.ts`),
	],
	external: [
		`@robertakarobin/web`,
	],
	format: `iife`,
	outfile: path.join(distDir, `script.js`),
});

for (const routeName in routes) {
	const routePath = routes[routeName as keyof typeof routes];
	const template = await resolve(routePath);
	const compiled = pretty(template, { ocd: true });
	const outName = routePath === `/` ? `index` : routePath;
	const outDir = path.join(distDir, path.dirname(routePath));
	const outPath = path.join(outDir, `${outName}.html`);
	fs.mkdirSync(outDir, { recursive: true });
	fs.writeFileSync(outPath, compiled);
}

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
