// soFar.ts => soFarts, lol

import { preciseTo } from '../math/preciseTo';

/**
 * Time "so far". Just compares performance.now() to its last value.
 */
export const soFarTimer = () => {
	let timeMemory: number | undefined;

	return () => {
		const timeNow = performance.now();
		const timeLast = timeMemory;
		timeMemory = timeNow;

		if (timeLast === undefined) {
			return NaN;
		}

		const timeDifference = timeNow - timeLast;

		if (timeDifference === 0) {
			return Number.MIN_VALUE; // Node's performance.now is higher-res than Chrome, which sometimes returns the same value multiple times. TODO3: Are there reasons to NOT always want performance.now() to increment?
		}

		return preciseTo(timeDifference);
	};
};
