import { preciseTo } from './preciseTo.ts';

/**
 * Round to the specified multiple
 */
export function roundTo(input: number, multiple = 1) {
	let result = Math.round(input / multiple) * multiple;
	if (multiple < 1) {
		result = preciseTo(result); // Get rid of float bits
	}
	return result;
}
