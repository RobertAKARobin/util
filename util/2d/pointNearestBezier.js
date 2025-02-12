/**
 * @import { Bezier, Coordinate, CoordinateLike } from './types.d';
 */

import { roundTo } from '../math/roundTo.js';

import { bezierPoint } from './bezierPoint.js';
import { findPercent } from './findPercent.js';
import { getDistance } from './distance.js';
import { toCoordinate } from './toCoordinate.js';

/**
 * Given a target coordinate and a Bezier curve, approximate the point on the curve nearest the coordinate.
 * @param {CoordinateLike} coordinateLike
 * @param {Bezier} bezier
 * @param {number} [tolerance=1]
 * @returns {Coordinate}
 */
export function pointNearestBezier(
	coordinateLike,
	bezier,
	tolerance = 1,
) {
	const target = toCoordinate(coordinateLike);

	let point = { x: NaN, y: NaN };

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
