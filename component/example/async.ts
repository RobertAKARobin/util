import * as esbuild from 'esbuild';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

import baseStyles from './styles/index.css.ts';

const baseDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(baseDir, `/dist`);

fs.rmSync(distDir, { force: true, recursive: true });
fs.mkdirSync(distDir);

fs.writeFileSync(path.join(distDir, `index.css`), baseStyles);

const context = await esbuild.context({
	bundle: true,
	entryPoints: [
		path.join(baseDir, `./index.ts`),
	],
	outfile: path.join(distDir, `index.js`),
});

void context.watch();
void context.serve({
	servedir: baseDir,
});
