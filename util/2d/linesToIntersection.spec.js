/**
 * @import { Coordinate } from '../types.d';
 */

import { test } from '../spec/index';

import { linesToIntersection } from './linesToIntersection';

/**
 * Force non-null
 * @param {Parameters<linesToIntersection>} params
 * @ignore
 */
function linesToIntersection_(...params) {
	return /** @type {Coordinate} */(linesToIntersection(...params));
}

export const spec = test(import.meta.url, $ => {
	/** @type {Coordinate} */
	let intersection;

	$.log(() => intersection = linesToIntersection_([[3, 9], [6, 13]], [[6, 6], [0, 12]]));
	$.assert(x => x(intersection.x) === 3);
	$.assert(x => x(intersection.y) === 9);

	$.log(() => intersection = linesToIntersection_([[3, 9], [6, 13]], [[0, 12], [6, 6]]));
	$.assert(x => x(intersection.x) === 3);
	$.assert(x => x(intersection.y) === 9);

	$.log(() => intersection = linesToIntersection_([[0, 0], [1, 1]], [[1, 1], [2, 2]])); // Parallel lines
	$.assert(x => x(intersection) === undefined);

	$.log(() => intersection = linesToIntersection_([[0, 5], [-3, 1]], [[6, 6], [0, 12]])); // Outside bounds
	$.assert(x => x(intersection) === undefined);

	$.log(() => intersection = linesToIntersection_([[0, 12], [0, 12]], [[6, 6], [0, 12]])); // One line is a point
	$.assert(x => x(intersection) === undefined);
});
