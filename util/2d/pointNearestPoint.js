import type { Coordinate, CoordinateLike } from '../types.d';
import { getDistance } from './distance';
import { toCoordinate } from './toCoordinate';

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
