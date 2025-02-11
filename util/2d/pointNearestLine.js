/**
 * @import { Coordinate, CoordinateLike, LineLike } from './types.d';
 */

import { constrain } from '../math/constrain';

import { toCoordinate } from './toCoordinate';
import { toLine } from './toLine';

/**
 * Given a target coordinate and a line, find the point on the line nearest the coordinate
 * @param {CoordinateLike} coordinateLike
 * @param {LineLike} lineLike
 * @returns {Coordinate}
 */
export function pointNearestLine(coordinateLike, lineLike) {
	const target = toCoordinate(coordinateLike);
	const { begin, end } = toLine(lineLike);
	const rise = end.y - begin.y;
	const run = end.x - begin.x;

	if (rise === 0) {
		return {
			x: constrain(target.x, begin.x, end.x),
			y: begin.y,
		};
	}

	if (run === 0) {
		return {
			x: begin.x,
			y: constrain(target.y, begin.y, end.y),
		};
	}

	const multiplier = (
		((target.x - begin.x) * run) + ((target.y - begin.y) * rise)
	) / (rise ** 2 + run ** 2);
	return {
		x: begin.x + (multiplier * run),
		y: begin.y + (multiplier * rise),
	};
}
