import { preciseTo } from './preciseTo.js';

/**
 * Round to the specified multiple
 * @param {number} input
 * @param {number} [multiple]
 * @returns {number}
 */
export function roundTo(input, multiple = 1) {
	let result = Math.round(input / multiple) * multiple;
	if (multiple < 1) {
		result = preciseTo(result); // Get rid of float bits
	}
	return result;
}
