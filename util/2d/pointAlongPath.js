/**
 * @import { Bezier, Coordinate, CoordinateLike, LineLike, Segment } from './types.d';
 */

import { pointAlongBezier } from './pointAlongBezier';
import { pointNearestLine } from './pointNearestLine';
import { segmentNearestPoint } from './segmentNearestPoint';
import { toCoordinate } from './toCoordinate';

/**
 * Given a target coordinate and a path (which is an array of segments), approximate the point on the path most vertically- or horizontally-aligned to the coordinate
 * @param {CoordinateLike} coordinateLike
 * @param {Array<Segment>} path
 * @param {number} [tolerance=1]
 * @returns {Coordinate}
 */
export function pointAlongPath(
	coordinateLike,
	path,
	tolerance = 1,
) {
	const target = toCoordinate(coordinateLike);
	const segmentIndex = segmentNearestPoint(target, ...path);
	const segment = path[segmentIndex];
	if (segment.length === 4) {
		return pointAlongBezier(
			target,
			/** @type {Bezier} */(segment),
			tolerance,
		);
	}
	return pointNearestLine(
		target,
		/** @type {LineLike} */(segment),
	);
}
