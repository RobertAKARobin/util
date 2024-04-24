import { roundTo } from './math/roundTo.ts';

// soFarts, lol

let timeMemory: number | undefined;

/**
 * Just compares performance.now() to its last value
 */
export const soFar = (precision = 2): number | undefined => {
	const timeNow = performance.now();
	const timeLast = timeMemory;
	timeMemory = timeNow;

	if (timeLast === undefined) {
		return undefined;
	}

	const timeDifference = timeNow - timeLast;
	return roundTo(timeDifference, precision);
};
