import { sortNumbers } from '../group/sortNumbers';

/**
 * Given a number and a min and max value, returns the min if the number is smaller than the min, the max if larger than the max, the number otherwise.
 * @param {number} min
 * @param {number} subject
 * @param {number} max
 * @returns {number}
 */
export function constrain(min, subject, max) {
	return sortNumbers(min, subject, max)[1];
}

/**
 * Constrains the given number to between 0 and `max`, circling back to 0. e.g. if `max` is 360, -1 becomes 359 and 361 becomes 1
 * @param {number} subject
 * @param {number} max
 * @returns {number}
 */
export function constrainCircular(subject, max) {
	const remainder = subject % max;
	if (remainder < 0) {
		return max + remainder;
	}
	return remainder;
}
