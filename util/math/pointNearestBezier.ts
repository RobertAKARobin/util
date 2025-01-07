import type { Bezier, Coordinate, CoordinateLike } from '../types.d';
import { bezierPoint } from './bezierPoint';
import { findPercent } from './findPercent';
import { getDistance } from './distance';
import { roundTo } from './roundTo';
import { toCoordinate } from './toCoordinate';

/**
 * Given a target coordinate and a Bezier curve, approximate the point on the curve nearest the coordinate.
 */
export function pointNearestBezier(
	coordinateLike: CoordinateLike,
	bezier: Bezier,
	tolerance = 1,
): Coordinate {
	const target = toCoordinate(coordinateLike);
	let point!: Coordinate;
	findPercent(percent => {
		point = bezierPoint(...bezier, percent);
		const offset = roundTo(getDistance([target, point]), tolerance);
		return offset;
	});
	return {
		x: roundTo(point.x, tolerance),
		y: roundTo(point.y, tolerance),
	};
}
