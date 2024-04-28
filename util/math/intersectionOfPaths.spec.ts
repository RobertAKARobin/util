import type { Coordinate } from '../types.d.ts';
import { test } from '../spec/index.ts';

import { intersectionOfPaths } from './intersectionOfPaths.ts';

export const spec = test(`intersect`, $ => {
	let intersection: Coordinate;
	$.log(() => intersection = intersectionOfPaths([[3, 9], [6, 13]], [[6, 6], [0, 12]])!);
	$.assert(x => x(intersection.x) === 3);
	$.assert(x => x(intersection.y) === 9);

	$.log(() => intersection = intersectionOfPaths([[3, 9], [6, 13]], [[0, 12], [6, 6]])!);
	$.assert(x => x(intersection.x) === 3);
	$.assert(x => x(intersection.y) === 9);

	$.log(() => intersection = intersectionOfPaths([[0, 0], [1, 1]], [[1, 1], [2, 2]])!); // Parallel lines
	$.assert(x => x(intersection) === undefined);

	$.log(() => intersection = intersectionOfPaths([[0, 5], [-3, 1]], [[6, 6], [0, 12]])!); // Outside bounds
	$.assert(x => x(intersection) === undefined);

	$.log(() => intersection = intersectionOfPaths([[0, 12], [0, 12]], [[6, 6], [0, 12]])!); // One line is a point
	$.assert(x => x(intersection) === undefined);
});
