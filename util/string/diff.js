/**
 * @import {Overlap} from '../group/findOverlap.js';
 */

import { findOverlap } from '../group/findOverlap.js';
import { sortOn } from '../group/sortOn.js';

/**
 * @typedef {{ action: 'added' | 'removed' | ''; value: string }} DiffChunk
 */

/**
 * TODO1
 * @param {string} origin
 * @param {string} update
 * @param {object} [options]
 * @param {string} [options.delimiter]
 * @returns {Array<DiffChunk>}
 */
export function diff(origin, update, options = {}) {
	const diffChunks = /** @type {Array<DiffChunk>} */([]);

	if (origin === update) {
		if (origin.length > 0) {
			diffChunks.push({
				action: ``,
				value: origin,
			});
		}

		return diffChunks;
	}

	const delimiter = options.delimiter ?? `\n`;

	let originSplit = origin.split(delimiter);

	let updateSplit = update.split(delimiter);

	/**
	 * @param {DiffChunk['action']} action
	 * @param {number} [beginIndex]
	 * @param {number} [endIndex]
	 */
	function action(action, beginIndex = 0, endIndex = Infinity) {
		if (beginIndex === endIndex) {
			return;
		}

		const source = action === `added` ? updateSplit : originSplit;
		const value = source.slice(beginIndex, endIndex).join(delimiter);

		if (action === `` && value === ``) {
			return;
		}

		diffChunks.push({ action, value });
	}

	if (origin.length > 0 && update.length === 0) {
		action(`removed`);
		return diffChunks;
	}

	if (origin.length === 0 && update.length > 0) {
		action(`added`);
		return diffChunks;
	}

	while (true) {
		const overlap = findOverlap(originSplit, updateSplit);

		if (overlap.length === 0) {
			if (originSplit.length > 0) {
				action(`removed`);
			}

			if (updateSplit.length > 0) {
				action(`added`);
			}

			break;
		}

		action(`removed`, 0, overlap.indexA);
		action(`added`, 0, overlap.indexB);
		action(``, overlap.indexA, overlap.indexA + overlap.length);

		originSplit = originSplit.slice(overlap.indexA + overlap.length);
		updateSplit = updateSplit.slice(overlap.indexB + overlap.length);
	}

	// Handle when a chunk was simply moved from one end of a sequence to the other
	// for (let index = 2; index < diffChunks.length; index += 1) {
	// 	const prev2 = diffChunks[index - 2];
	// 	const prev1 = diffChunks[index - 1];
	// 	const current = diffChunks[index];

	// 	if (
	// 		prev2.value.length > prev1.value.length
	// 		&& prev2.value === current.value
	// 		&& prev1.action === ``
	// 	) {
	// 		if (prev2.action === `added` && current.action === `removed`) {
	// 			prev2.value = prev1.value;
	// 			prev2.action = `removed`;
	// 			prev1.value = current.value;
	// 			current.value = prev2.value;
	// 			current.action = `added`;
	// 		} else if (prev2.action === `removed` && current.action === `added`) {
	// 			prev2.value = prev1.value;
	// 			prev2.action = `added`;
	// 			prev1.value = current.value;
	// 			current.value = prev2.value;
	// 			current.action = `removed`;
	// 		}
	// 	}
	// }

	// if (diffChunks.length > 2) {
	// 	for (let index = 0; index < diffChunks.length - 1; index += 1) {
	// 		const diffChunk = diffChunks[index];
	// 		diffChunk.value += delimiter;
	// 	}
	// }

	return diffChunks;
}
