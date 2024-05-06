import type { Coordinate } from '../types.d.ts';

/**
 * Given an array of points, as in control points along a Bezier curve, return a new array of midpoints at the given points.
 * @param options.includeOriginal Include the given points in the output
 * @param options.percent The percent length between each pair of points at which the midpoint should be placed. Default .5
 */
export function pointsToMidpoints(
	points: Array<Coordinate>,
	options: {
		includeGiven?: boolean;
		percent?: number;
	} = {}
): Array<Coordinate> {
	const includeGiven = options.includeGiven ?? false;
	const percent = options.percent ?? .5;

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
		if (includeGiven) {
			midpoints.push(current);
		}
		midpoints.push({
			x: current.x + (percent * (next.x - current.x)),
			y: current.y + (percent * (next.y - current.y)),
		});
	}

	if (includeGiven) {
		midpoints.push(points[points.length - 1]);
	}

	return midpoints;
}
