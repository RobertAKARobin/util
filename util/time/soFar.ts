// soFar.ts => soFarts, lol

import { preciseTo } from '../math/preciseTo.ts';

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
		return preciseTo(timeDifference);
	};
};
