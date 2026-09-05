import fs from 'fs';

import { test } from '../spec/index.js';

import { pathRelative } from './pathRelative.js';
import { tryCatch } from '../tryCatch.js';

import { readRelative } from './readRelative.js';

export const spec = test(import.meta.url, $ => {
	const filepath = pathRelative(import.meta.url, `foo`);
	fs.writeFileSync(filepath, `42`);
	$.assert(x => x(readRelative(import.meta.url, `foo`)) === `42`);
	$.assert(x => x(readRelative(filepath)) === `42`);
	fs.rmSync(filepath);
	$.assert(x => (x(/** @type {Error} */(tryCatch(() => readRelative(filepath))).message).startsWith(`ENOENT`)));
});
