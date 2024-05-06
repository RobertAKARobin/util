import { sortNumbers } from '../group/sortNumbers.ts';

/**
 * Given a number and a min and max value, returns the min if the number is smaller than the min, the max if larger than the max, the number otherwise.
 */
export function constrain(min: number, subject: number, max: number) {
	return sortNumbers(min, subject, max)[1];
}
