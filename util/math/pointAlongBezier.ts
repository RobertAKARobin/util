import type { Bezier, Coordinate, CoordinateLike } from '../types.d.ts';
import { bezierPoint } from './bezierPoint.ts';
import { findPercent } from './findPercent.ts';
import { isBetween } from './isBetween.ts';
import { pointsToAngles } from './pointsToAngles.ts';
import { roundTo } from './roundTo.ts';
import { toCoordinate } from './toCoordinate.ts';

/**
 * Given a coordinate and a bezier, return the point on the bezier most vertically- or horizontally-aligned to the coordinate
 */
export function pointAlongBezier(
	coordinateLike: CoordinateLike,
	bezier: Bezier,
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
	const alongAxis: keyof Coordinate = (
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
