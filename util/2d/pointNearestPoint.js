/**
 * @import { Coordinate, CoordinateLike } from '../types.d';
 */

import { getDistance } from './distance';
import { toCoordinate } from './toCoordinate';

/**
 * Given a target coordinate and an array of points, return the point closest to the target
 * @param {CoordinateLike} coordinateLike
 * @param {Array<CoordinateLike>} options
 * @returns {Coordinate}
 */
export function pointNearestPoint(coordinateLike, ...options) {
	const target = toCoordinate(coordinateLike);
	const points = options.map(toCoordinate);

	let nearestDistance = Infinity;
	/** @type {Coordinate} */
	let nearestPoint = { x: NaN, y: NaN };

	for (const point of points) {
		const pointDistance = getDistance([point, target]);
		if (pointDistance < nearestDistance) {
			nearestDistance = pointDistance;
			nearestPoint = point;
		}
	}

	return nearestPoint;
}
