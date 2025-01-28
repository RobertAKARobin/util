import { getSum } from './sum';

/**
 * Returns the mean of the given numbers
 * @param {Array<number>} inputs
 * @returns {number}
 */
export function mean(...inputs) {
	return getSum(...inputs) / inputs.length;
}
