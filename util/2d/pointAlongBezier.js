/**
 * @import { Bezier, Coordinate, CoordinateLike } from './types.d';
 */

import { isBetween } from '../math/isBetween.js';
import { roundTo } from '../math/roundTo.js';

import { bezierPoint } from './bezierPoint.js';
import { findPercent } from './findPercent.js';
import { pointsToAngles } from './pointsToAngles.js';
import { toCoordinate } from './toCoordinate.js';

/**
 * Given a coordinate and a bezier, return the point on the bezier most vertically- or horizontally-aligned to the coordinate
 * @param {CoordinateLike} coordinateLike
 * @param {Bezier} bezier
 * @param {number} [tolerance=1]
 * @returns {Coordinate}
 */
export function pointAlongBezier(
	coordinateLike,
	bezier,
	tolerance = 1,
) {
	const target = toCoordinate(coordinateLike);
	const begin = bezier[0];
	const end = bezier[bezier.length - 1];
	let [angle] = pointsToAngles(end, begin, { // Calculate angle between slope and x-axis
		x: begin.x + 1,
		y: begin.y,
	});
	angle = angle % Math.PI / 2; // If below X-axis, reflect it above X-axis, for simplicity

	const angle45 = Math.PI / 8;
	const alongAxis = (
		isBetween(angle45 * 1, angle, angle45 * 3) ? `y` : `x`
	);

	const percent = findPercent(percent => {
		const point = bezierPoint(...bezier, percent);
		let offset = Math.abs(point[alongAxis] - target[alongAxis]);
		offset = roundTo(offset, tolerance);
		return offset;
	});

	const point = bezierPoint(...bezier, percent);

	return {
		x: roundTo(point.x, tolerance),
		y: roundTo(point.y, tolerance),
	};
}
