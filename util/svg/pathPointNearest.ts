import type { Coordinate, CoordinateLike } from '../types.d.ts';
import { distance } from '../math/distance.ts';
import { toCoordinate } from '../math/toCoordinate.ts';

export function pathPointNearest(
	path: SVGGeometryElement,
	subject: CoordinateLike,
	options: {
		tolerance?: number;
	} = {}
): Coordinate {
	const origin = toCoordinate(subject);
	const svg = path.ownerSVGElement!;
	const point = svg.createSVGPoint(); // TODO3: Technically deprecated. Revisit when the SVG working group and browsers get their act together
	point.x = origin.x;
	point.y = origin.y;
	if (path.isPointInStroke(point)) {
		return origin;
	}

	const pathLength = path.getTotalLength();
	const tolerance = options.tolerance ?? 1;

	let lengthLower = 0;
	let lengthUpper = pathLength;
	while (true) {
		const lengthOffset = ((lengthUpper - lengthLower) / 2);
		const lengthMiddle = lengthLower + lengthOffset;
		const boundLower = path.getPointAtLength(lengthLower);
		const boundMiddle = path.getPointAtLength(lengthMiddle);
		const boundUpper = path.getPointAtLength(lengthUpper);

		const distanceLower = distance([origin, boundLower]);
		const distanceMiddle = distance([origin, boundMiddle]);
		const distanceUpper = distance([origin, boundUpper]);

		if (
			(distanceUpper !== distanceLower)
			&& Math.abs(distanceUpper - distanceLower) <= (tolerance / 2)
		) {
			return {
				x: Math.round(boundMiddle.x * tolerance) / tolerance,
				y: Math.round(boundMiddle.y * tolerance) / tolerance,
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
