/**
 * @import { BookOrderOptions } from './bookorder.js';
 */

import { suite, test } from '../spec/index.js';

import { bookOrder } from './bookorder.js';

function subject(
	/** @type {number} */ pages,
	/** @type {BookOrderOptions} */ options = {},
) {
	return bookOrder(pages, options)
		.map(leaf => leaf.join(` `))
		.join(`, `);
}

export const spec = suite(import.meta.url, {},
	test(`ideal number`, $ => {
		$.assert(x => x(subject(12)) === `0 11 1 10, 2 9 3 8, 4 7 5 6`);
	}),

	test(`rounds up to ideal number`, $ => {
		$.assert(x => x(subject(11)) === `0 11 1 10, 2 9 3 8, 4 7 5 6`);
		$.assert(x => x(subject(13)) === `0 15 1 14, 2 13 3 12, 4 11 5 10, 6 9 7 8`);
	}),

	test(`specify leavesPerSignature`, $ => {
		$.assert(x => x(subject(12, { leavesPerSignature: 1 })) === `0 3 1 2, 4 7 5 6, 8 11 9 10`);
		$.assert(x => x(subject(12, { leavesPerSignature: 2 })) === `0 7 1 6, 2 5 3 4, 8 15 9 14, 10 13 11 12`);
	}),
);
