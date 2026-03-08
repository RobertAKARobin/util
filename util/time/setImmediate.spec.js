import { test } from '../spec/index.js';

import { setImmediate } from './setImmediate.js';

export const spec = test(import.meta.url, $ => {
	let count = 0;

	setImmediate(() => {
		count += 1;

		$.assert(x => x(count) === 1);
	});

	$.assert(x => x(count) === 0);
});
