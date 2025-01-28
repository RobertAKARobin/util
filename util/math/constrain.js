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
