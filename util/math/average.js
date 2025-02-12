import { getSum } from './sum.js';

/**
 * Returns the mean of the given numbers
 * @param {Array<number>} inputs
 * @returns {number}
 */
export function mean(...inputs) {
	return getSum(...inputs) / inputs.length;
}
