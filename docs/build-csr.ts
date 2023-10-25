import * as esbuild from 'esbuild';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

import { baseStyles } from './styles/index.css.ts';

const baseDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(baseDir, `/public`);
const distDir = path.join(baseDir, `/public`, `/dist`);

fs.rmSync(distDir, { force: true, recursive: true });
fs.mkdirSync(distDir);

fs.writeFileSync(path.join(distDir, `index.css`), baseStyles);

fs.copyFileSync(
	path.join(baseDir, `index.html`), path.join(publicDir, `index.html`)
);

const context = await esbuild.context({
	bundle: true,
	entryPoints: [
		path.join(baseDir, `./index.ts`),
	],
	outfile: path.join(distDir, `index.js`),
});

if (process.env.env !== `PROD`) {
	void context.watch();
	void context.serve({
		fallback: path.join(baseDir, `./public/index.html`),
		servedir: publicDir,
	});
	console.log(`Serving...`);
}
