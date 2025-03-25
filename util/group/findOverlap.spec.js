import { isNotNull } from '../isNotNull.js';
import { test } from '../spec/index.js';

import { findOverlap } from './findOverlap.js';

export const spec = test(import.meta.url, $ => {
	function subject(
		/** @type {string} */origin,
		/** @type {string} */update,
	) {
		$.log(`\n'${origin}' => \n'${update}'`);
		const out = findOverlap(origin.split(``), update.split(``));
		return isNotNull(out);
	}

	let overlap = subject(`12345`, `abcde`);
	$.assert(x => x(overlap.length) === 0);
	$.assert(x => x(overlap.originIndex) === -1);
	$.assert(x => x(overlap.updateIndex) === -1);

	overlap = subject(`12345`, `a4bcde`);
	$.assert(x => x(overlap.originIndex) === 3);
	$.assert(x => x(overlap.updateIndex) === 1);
	$.assert(x => x(overlap.length) === 1);

	overlap = subject(`1234445`, `a444bcde`);
	$.assert(x => x(overlap.originIndex) === 3);
	$.assert(x => x(overlap.updateIndex) === 1);
	$.assert(x => x(overlap.length) === 3);

	overlap = subject(`1234445`, `a4444bcde`);
	$.assert(x => x(overlap.originIndex) === 3);
	$.assert(x => x(overlap.updateIndex) === 1);
	$.assert(x => x(overlap.length) === 3);

	overlap = subject(`12344445`, `a444bcde`);
	$.assert(x => x(overlap.originIndex) === 3);
	$.assert(x => x(overlap.updateIndex) === 1);
	$.assert(x => x(overlap.length) === 3);
});
