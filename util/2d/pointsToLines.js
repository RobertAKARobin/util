/**
 * @import { Coordinate, Line } from '../types.d';
 */

/**
 * Given an array of coordinates, convert them to an array of lines connecting all coordinates
 * @param {Array<Coordinate>} points
 * @returns {Array<Line>}
 */
export function pointsToLines(points) {
	const out = /** @type {Array<Line>} */([]);

	let begin = points.shift();
	if (begin === undefined) {
		return out;
	}

	for (const point of points) {
		const end = point;
		out.push({ begin, end });
		begin = end;
	}
	return out;
}
