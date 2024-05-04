import type { Coordinate } from '../types.d.ts';

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
	let midpoints = points.filter((point, index) => { // Filter out overlapping points
		const next = points[index + 1];
		return (point.x !== next?.x || point.y !== next?.y);
	});

	while (midpoints.length > 1) {
		midpoints = pointsToMidpoints(percent, ...midpoints);
	}
	return midpoints[0];
}
