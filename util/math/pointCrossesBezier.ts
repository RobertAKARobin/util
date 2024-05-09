import type { Bezier, CoordinateLike } from '../types.d.ts';
import { bezierPoint } from './bezierPoint.ts';
import { findPercent } from './findPercent.ts';
import { pointsRotate } from './pointsRotate.ts';
import { pointsToAngles } from './pointsToAngles.ts';
import { roundTo } from './roundTo.ts';
import { toCoordinate } from './toCoordinate.ts';

/**
 * Given a coordinate and a Bezier, returns the point on the Bezier that would meet the coordinate at a slope perpendicular to the Bezier's overall slope. (`pointPerpendicularToBezier` was a bit wordy.)
 */
export function pointCrossesBezier(
	coordinateLike: CoordinateLike,
	bezier: Bezier,
	tolerance = 1,
) {
	const target = toCoordinate(coordinateLike);
	const begin = bezier[0];
	const end = bezier[bezier.length - 1];
	const [angle] = pointsToAngles(end, begin, { // Calculate angle between slope and x-axis
		x: begin.x + 1,
		y: begin.y,
	});

	const [rotatedTarget, ...rotatedBezier] = pointsRotate([target, ...bezier], begin, angle, { unit: `radian` });

	const percent = findPercent(percent => {
		const point = bezierPoint(...rotatedBezier as Bezier, percent);
		let offset = Math.abs(point.x - rotatedTarget.x);
		offset = roundTo(offset, tolerance);
		return offset;
	});

	const point = bezierPoint(...bezier, percent);

	return {
		x: roundTo(point.x, tolerance),
		y: roundTo(point.y, tolerance),
	};
}
