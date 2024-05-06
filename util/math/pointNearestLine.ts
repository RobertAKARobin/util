import type { Coordinate, CoordinateLike, LineLike } from '../types.d.ts';
import { toCoordinate } from './toCoordinate.ts';
import { toLine } from './toLine.ts';

/**
 * Given a target coordinate and a line, find the point on the line nearest the coordinate
 */
export function pointNearestLine(
	coordinateLike: CoordinateLike,
	lineLike: LineLike,
): Coordinate {
	const target = toCoordinate(coordinateLike);
	const { begin, end } = toLine(lineLike);
	const rise = end.y - begin.y;
	const run = end.x - begin.x;
	const multiplier = (
		((target.x - begin.x) * run) + ((target.y - begin.y) * rise)
	) / (rise ** 2 + run ** 2);
	return {
		x: begin.x + (multiplier * run),
		y: begin.y + (multiplier * rise),
	};
}
