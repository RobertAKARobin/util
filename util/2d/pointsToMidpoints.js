/**
 * @import { Coordinate } from './types.d';
 */

/**
 * Given an array of points, as in control points along a Bezier curve, return a new array of midpoints at the given points.
 * @param {Array<Coordinate>} points
 * @param {object} [options]
 * @param {boolean} [options.includeGiven=false] - Include the given points in the output
 * @param {number} [options.percent=.5] - The percent length between each pair of points at which the midpoint should be placed. Default .5
 * @returns {Array<Coordinate>}
 */
export function pointsToMidpoints(
	points,
	options = {},
) {
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

	const midpoints = [];
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
