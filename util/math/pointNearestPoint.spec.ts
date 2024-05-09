import { test } from '../spec/index.ts';

import type { CoordinateLike } from '../types.d.ts';
import { pointNearestPoint } from './pointNearestPoint.ts';
import { pointToString } from './pointToString.ts';

export const spec = test(import.meta.url, $ => {
	const points = [[0, 0], [3, 0], [3, 4]];
	const result = (target: CoordinateLike) => {
		const result = pointNearestPoint(target, ...points);
		return pointToString(result);
	};

	$.assert(x => x(result([0, 0])) === `0,0`);
	$.assert(x => x(result([1, 1])) === `0,0`);

	$.assert(x => x(result([3, 0])) === `3,0`);
	$.assert(x => x(result([3, 1])) === `3,0`);

	$.assert(x => x(result([2, 4])) === `3,4`);
});
