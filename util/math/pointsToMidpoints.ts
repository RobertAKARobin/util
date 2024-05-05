import type { Coordinate } from '../types.d.ts';

/**
 * Given an array of points, as in control points along a Bezier curve, and a n% length, return a new array of midpoints at n% between the given points.
 */
export function pointsToMidpoints(
	percent: number,
	...points: Array<Coordinate>
): Array<Coordinate> {
	if (points.length === 1) {
		return [{ ...points[0] }];
	}

	if (percent === 0) {
		return [{ ...points[0] }];
	}

	if (percent === 1) {
		return [{ ...points[points.length - 1] }];
	}

	const midpoints = [] as Array<Coordinate>;
	for (let index = 0, length = points.length; index < length - 1; index += 1) {
		const current = points[index];
		const next = points[index + 1];
		midpoints.push({
			x: current.x + (percent * (next.x - current.x)),
			y: current.y + (percent * (next.y - current.y)),
		});
	}

	return midpoints;
}
