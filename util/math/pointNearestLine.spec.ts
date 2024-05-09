import { test } from '../spec/index.ts';

import type { Coordinate } from '../types.d.ts';
import { pointNearestLine } from './pointNearestLine.ts';

export const spec = test(import.meta.url, $ => {
	let foot: Coordinate;

	foot = pointNearestLine([3, 3], [[0, 2], [2, 0]]);
	$.assert(x => x(foot.x) === 1);
	$.assert(x => x(foot.y) === 1);

	foot = pointNearestLine([4, 4], [[1, 3], [5, 1]]);
	$.assert(x => x(foot.x) === 3);
	$.assert(x => x(foot.y) === 2);

	foot = pointNearestLine([0, 0], [[5, 5], [50, 5]]);
	$.assert(x => x(foot.x) === 5);
	$.assert(x => x(foot.y) === 5);

	foot = pointNearestLine([25, 0], [[5, 5], [50, 5]]);
	$.assert(x => x(foot.x) === 25);
	$.assert(x => x(foot.y) === 5);
});
