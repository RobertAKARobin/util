import fs from 'fs';

import { test } from '../spec/index.js';

import { pathRelative } from './pathRelative.js';
import { tryCatch } from '../tryCatch.js';

import { readRelative } from './readRelative.js';

export const spec = test(import.meta.url, $ => {
	fs.writeFileSync(pathRelative(import.meta.url, `foo`), `42`);
	$.assert(x => x(readRelative(import.meta.url, `foo`)) === `42`);
	fs.rmSync(pathRelative(import.meta.url, `foo`));
	$.assert(x => (x(/** @type {Error} */(tryCatch(() => readRelative(import.meta.url, `foo`))).message).startsWith(`ENOENT`)));
});
