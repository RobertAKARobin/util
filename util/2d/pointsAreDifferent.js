/**
 * @import { Coordinate, CoordinateLike } from './types.d';
 */

import { pointToString } from './pointToString';
import { toCoordinate } from './toCoordinate';

/**
 * Returns whether all the given points are unique.
 * @param {Array<CoordinateLike>} points
 * @returns {boolean}
 */
export function pointsAreDifferent(...points) {
	const used = /** @type {Record<string, boolean>} */({});
	for (const coordinateLike of points) {
		const point = toCoordinate(coordinateLike);
		const id = pointToString(point);
		if (used[id]) {
			return false;
		}
		used[id] = true;
	}
	return true;
}
