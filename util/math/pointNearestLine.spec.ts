import { test } from '../spec/index.ts';

import { pointNearestLine } from './pointNearestLine.ts';

export const spec = test(`pointNearestLine`, $ => {
	let foot = pointNearestLine([3, 3], [[0, 2], [2, 0]]);
	$.assert(x => x(foot.x) === 1);
	$.assert(x => x(foot.y) === 1);

	foot = pointNearestLine([4, 4], [[1, 3], [5, 1]]);
	$.assert(x => x(foot.x) === 3);
	$.assert(x => x(foot.y) === 2);
});
