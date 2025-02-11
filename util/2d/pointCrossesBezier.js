/**
 * @import { Bezier, Coordinate, CoordinateLike } from './types.d';
 */

import { roundTo } from '../math/roundTo';

import { bezierPoint } from './bezierPoint';
import { findPercent } from './findPercent';
import { pointsRotate } from './pointsRotate';
import { pointsToAngles } from './pointsToAngles';
import { toCoordinate } from './toCoordinate';

/**
 * Given a coordinate and a Bezier, returns the point on the Bezier that would meet the coordinate at a slope perpendicular to the Bezier's overall slope. (`pointPerpendicularToBezier` was a bit wordy.)
 * @param {CoordinateLike} coordinateLike
 * @param {Bezier} bezier
 * @param {number} [tolerance=1]
 * @returns {Coordinate}
 */
export function pointCrossesBezier(
	coordinateLike,
	bezier,
	tolerance = 1,
) {
	const target = toCoordinate(coordinateLike);
	const begin = bezier[0];
	const end = bezier[bezier.length - 1];
	const [angle] = pointsToAngles(end, begin, { // Calculate angle between slope and x-axis
		x: begin.x + 1,
		y: begin.y,
	});

	const [rotatedTarget, ...rotatedBezier_] = pointsRotate([target, ...bezier], begin, angle, { unit: `radian` });
	const rotatedBezier = /** @type {Bezier} */(rotatedBezier_);

	const intersectionPercent = findPercent(percent => {
		const intersection = bezierPoint(...rotatedBezier, percent);
		let offset = Math.abs(intersection.x - rotatedTarget.x);
		offset = roundTo(offset, tolerance);
		return offset;
	});

	const intersection = bezierPoint(...bezier, intersectionPercent);

	return {
		x: roundTo(intersection.x, tolerance),
		y: roundTo(intersection.y, tolerance),
	};
}
