import { test } from '../spec/index.js';

import { diff } from './diff.js';

/**
 * @param {string} expected
 * @param {string} actual
 * @returns {string}
 */
export function subject(expected, actual) {
	return diff(expected, actual, {
		delimiter: ` `,
	}).join(` `);
}

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(subject(`a`, `a`)) === `.`);
	$.assert(x => x(subject(`a`, `b`)) === `- +`);
	$.assert(x => x(subject(`a a b b`, `b b c c`)) === `- - . . + +`);
	$.assert(x => x(subject(`a a b b`, `b b a a`)) === `- - . . + +`);
	$.assert(x => x(subject(`a b c`, `d e f`)) === `- - - + + +`);
});
