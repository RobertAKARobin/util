/**
 * @typedef {{ action: 'added' | 'removed' | ''; value: string }} DiffChunk
 */

import { findOverlap } from '../group/findOverlap.js';

/**
 * TODO1
 * @param {string} origin
 * @param {string} update
 * @param {object} [options]
 * @param {string} [options.delimiter]
 * @returns {Array<DiffChunk>}
 */
export function diff(origin, update, options = {}) {
	const delimiter = options.delimiter ?? `\n`;

	const results = /** @type {Array<DiffChunk>} */([]);

	if (origin === update) {
		return results;
	}

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

		if (value.length === 0) {
			return;
		}

		results.push({ action, value });
	}

	let count = 0;
	while (count++ <= 100) {
		const match = findOverlap(originSplit, updateSplit);

		if (match.length === 0) {
			if (originSplit.length > 0) {
				action(`removed`, 0);
			}

			if (updateSplit.length > 0) {
				action(`added`, 0);
			}

			return results;
		}

		action(`removed`, 0, match.originIndex);

		action(`added`, 0, match.updateIndex);

		action(``, match.originIndex, match.originIndex + match.length);

		originSplit = originSplit.slice(match.originIndex + match.length);
		updateSplit = updateSplit.slice(match.updateIndex + match.length);
	}

	return results;
}
