import { build } from '@robertakarobin/web/build.ts';
import { fileURLToPath } from 'url';
import path from 'path';

import { resolve, routes } from './routes.ts';

const baseDir = path.join(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(baseDir, `dist`);

build(routes, resolve, {
	baseDir,
	distDir,
	statics: [
		[(await import(`./styles.css.ts`)).default, `styles.css`],
		`script.ts`,
	],
});
