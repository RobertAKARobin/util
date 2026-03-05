import { test } from '../spec/index.js';

import { escape } from './escape.js';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(escape(`foo`)) === `foo`);
	$.assert(x => x(escape(`"foo"`)) === `\\"foo\\"`);
	$.assert(x => x(escape(`\``)) === `\``);
	$.assert(x => x(escape(`'`)) === `\'`);
	$.assert(x => x(escape(`\\`)) === `\\\\`);
});
