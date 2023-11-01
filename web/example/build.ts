import CleanCSS from 'clean-css';

import { build } from '@robertakarobin/web/build.ts';
import { fileURLToPath } from 'url';
import path from 'path';

import { resolve, routes } from './routes.ts';

const baseDir = path.join(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(baseDir, `dist`);

const cleanCss = new CleanCSS({ format: `beautify` });
const styles = cleanCss.minify((await import(`./styles.css.ts`)).default).styles;

build(routes, resolve, {
	baseDir,
	distDir,
	statics: [
		[styles, `styles.css`],
		`script.ts`,
	],
});
