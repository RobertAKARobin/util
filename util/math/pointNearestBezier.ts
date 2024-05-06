import type { Bezier, CoordinateLike } from '../types.d.ts';
import { bezierPoint } from './bezierPoint.ts';
import { distance } from './distance.ts';
import { toCoordinate } from './toCoordinate.ts';

/**
 * Given a target coordinate and a Bezier curve, approximate the point on the curve nearest the coordinate.
 */
export function pointNearestBezier(
	coordinateLike: CoordinateLike,
	bezier: Bezier,
	tolerance = 1,
) {
	const target = toCoordinate(coordinateLike);

	let lengthLower = 0;
	let lengthUpper = 1;
	while (true) {
		const lengthOffset = ((lengthUpper - lengthLower) / 2);
		const lengthMiddle = lengthLower + lengthOffset;
		const boundLower = bezierPoint(...bezier, lengthLower);
		const boundMiddle = bezierPoint(...bezier, lengthMiddle);
		const boundUpper = bezierPoint(...bezier, lengthUpper);

		const distanceLower = distance([target, boundLower]);
		const distanceMiddle = distance([target, boundMiddle]);
		const distanceUpper = distance([target, boundUpper]);

		if (
			(distanceUpper !== distanceLower)
			&& Math.abs(distanceUpper - distanceLower) <= (tolerance / 2)
		) {
			return {
				x: Math.round(boundMiddle.x / tolerance) * tolerance,
				y: Math.round(boundMiddle.y / tolerance) * tolerance,
			};
		}

		const nearest = Math.min(distanceLower, distanceMiddle, distanceUpper);
		switch (nearest) {
			case distanceLower: {
				lengthUpper = lengthLower + lengthOffset;
				break;
			}
			case distanceMiddle: {
				lengthLower = lengthMiddle - (lengthOffset / 2);
				lengthUpper = lengthMiddle + (lengthOffset / 2);
				break;
			}
			case distanceUpper: {
				lengthLower = lengthUpper - lengthOffset;
				break;
			}
		}
	}
}
