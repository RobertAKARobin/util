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
	const results = /** @type {Array<DiffChunk>} */([]);

	if (origin === update) {
		if (origin.length > 0) {
			results.push({
				action: ``,
				value: origin,
			});
		}

		return results;
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

		results.push({ action, value });
	}

	if (origin.length > 0 && update.length === 0) {
		action(`removed`);
		return results;
	}

	if (origin.length === 0 && update.length > 0) {
		action(`added`);
		return results;
	}

	while (true) {
		const match = findOverlap(originSplit, updateSplit);

		if (match.length === 0) {
			if (originSplit.length > 0) {
				action(`removed`);
			}

			if (updateSplit.length > 0) {
				action(`added`);
			}

			break;
		}

		action(`removed`, 0, match.indexA);

		action(`added`, 0, match.indexA);

		action(``, match.indexA, match.indexA + match.length);

		originSplit = originSplit.slice(match.indexA + match.length);
		updateSplit = updateSplit.slice(match.indexB + match.length);
	}

	// Handle when a chunk was simply moved from one end of a sequence to the other
	for (let index = 2; index < results.length; index += 1) {
		const prev2 = results[index - 2];
		const prev1 = results[index - 1];
		const current = results[index];

		if (
			prev2.value.length > prev1.value.length
			&& prev2.value === current.value
			&& prev1.action === ``
		) {
			if (prev2.action === `added` && current.action === `removed`) {
				prev2.value = prev1.value;
				prev2.action = `removed`;
				prev1.value = current.value;
				current.value = prev2.value;
				current.action = `added`;
			} else if (prev2.action === `removed` && current.action === `added`) {
				prev2.value = prev1.value;
				prev2.action = `added`;
				prev1.value = current.value;
				current.value = prev2.value;
				current.action = `removed`;
			}
		}
	}

	if (results.length > 2) {
		for (let index = 0; index < results.length - 1; index += 1) {
			results[index].value += delimiter;
		}
	}

	return results;
}
