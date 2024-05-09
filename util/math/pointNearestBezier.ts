import type { Bezier, Coordinate, CoordinateLike } from '../types.d.ts';
import { bezierPoint } from './bezierPoint.ts';
import { findPercent } from './findPercent.ts';
import { getDistance } from './distance.ts';
import { roundTo } from './roundTo.ts';
import { toCoordinate } from './toCoordinate.ts';

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
