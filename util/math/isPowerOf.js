import { preciseTo } from './preciseTo.js';

/**
 * Returns whether the given input is a power of the given number
 * @param {number} power
 * @param {number} input
 * @returns {boolean}
 */
export function isPowerOf(power, input) {
	return preciseTo(Math.log(input) / Math.log(power)) % 1 === 0; // https://stackoverflow.com/a/30924352/2053389
}
