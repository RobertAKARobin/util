import { test } from '../spec/index.js';
import { tryCatch } from '../tryCatch.js';

import { scriptLoad } from './scriptLoad.js';

export const spec = test(import.meta.url, async $ => {
	$.assert(() => document.querySelectorAll(`script[src="/foo/bar.js"]`).length === 0);

	const error = await tryCatch(() => scriptLoad(`/foo/bar.js`));
	$.assert(() => document.querySelectorAll(`script[src="/foo/bar.js"]`).length === 1);
	$.assert(x => x(/** @type {Event} */(error).type) === `error`);
});
