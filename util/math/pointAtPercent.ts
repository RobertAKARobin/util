import type { Coordinate } from '../types.d.ts';

import { pointsSeparated } from './pointsSeparated.ts';
import { pointsToMidpoints } from './pointsToMidpoints.ts';

/**
 * Given points along a line, and n% percent of the line's total length, approximate the coordinates of the point at that length.
 * https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm
 * https://github.com/tdzienniak/deCasteljau
 */
export function pointAtPercent(
	percent: number,
	...points: Array<Coordinate>
): Coordinate {
	let midpoints = pointsSeparated(...points);

	while (midpoints.length > 1) {
		midpoints = pointsToMidpoints(midpoints, { percent });
	}
	return midpoints[0];
}
