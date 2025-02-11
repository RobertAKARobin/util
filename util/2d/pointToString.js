/**
 * @import { CoordinateLike } from './types.d';
 */

import { toCoordinate } from './toCoordinate';

/**
 * Returns a coordinate as a string in `x,y` notation
 * @param {CoordinateLike} point
 * @returns {string}
 */
export function pointToString(point) {
	const { x, y } = toCoordinate(point);
	return `${x},${y}`;
}
