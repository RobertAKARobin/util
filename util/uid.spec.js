import { test } from './spec/index.js';

import { newUid } from './uid.js';

export const spec = test(import.meta.url, $ => {
	let count = 0;
	const uids = new Set();
	const dupes = new Set();
	while (count++ < 100) {
		const uid = newUid();
		if (uids.has(uid)) {
			dupes.add(uid);
		}
	}
	$.assert(x => x(dupes).size === 0);
});
