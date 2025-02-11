/**
 * @import { CoordinateLike } from './types.d';
 */

import { test } from '../spec/index';

import { pointNearestPoint } from './pointNearestPoint';
import { pointToString } from './pointToString';

export const spec = test(import.meta.url, $ => {
	const points = [[0, 0], [3, 0], [3, 4]];
	/**
	 * @param {CoordinateLike} target
	 * @ignore
	 */
	const result = target => {
		const result = pointNearestPoint(target, ...points);
		return pointToString(result);
	};

	$.assert(x => x(result([0, 0])) === `0,0`);
	$.assert(x => x(result([1, 1])) === `0,0`);

	$.assert(x => x(result([3, 0])) === `3,0`);
	$.assert(x => x(result([3, 1])) === `3,0`);

	$.assert(x => x(result([2, 4])) === `3,4`);
});
