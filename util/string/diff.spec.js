/**
 * @import { DiffChunk } from './diff.js';
 */

import { test } from '../spec/index.js';

import { diff } from './diff.js';

/**
 * @param {string} expected
 * @param {string} actual
 * @returns {string}
 */
export function subject(expected, actual) {
	return diff(expected, actual).map(chunk => `${chunk.action}${chunk.text}`).join(`|`);
}

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(subject(`a`, `a`)) === `a`);
	$.assert(x => x(subject(`a`, `b`)) === `-a|+b`);
});
