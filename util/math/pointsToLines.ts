import type { Coordinate, Line } from '../types.d.ts';

/**
 * Given an array of coordinates, convert them to an array of lines connecting all coordinates
 */
export function pointsToLines(points: Array<Coordinate>) {
	const out = [] as Array<Line>;
	let begin = points.shift()!;
	for (const point of points) {
		const end = point;
		out.push({ begin, end });
		begin = end;
	}
	return out;
}
