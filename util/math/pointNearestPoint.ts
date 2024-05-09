import type { Coordinate, CoordinateLike } from '../types.d.ts';
import { getDistance } from './distance.ts';
import { toCoordinate } from './toCoordinate.ts';

/**
 * Given a target coordinate and an array of points, return the point closest to the target
 */
export function pointNearestPoint(
	coordinateLike: CoordinateLike,
	...options: Array<CoordinateLike>
) {
	const target = toCoordinate(coordinateLike);
	const points = options.map(toCoordinate);
	let nearestDistance = Infinity;
	let nearestPoint!: Coordinate;
	for (const point of points) {
		const pointDistance = getDistance([point, target]);
		if (pointDistance < nearestDistance) {
			nearestDistance = pointDistance;
			nearestPoint = point;
		}
	}

	return nearestPoint;
}
