/**
 * @import { Coordinate, CoordinateLike } from '../types.d';
 */

import { pointRotate } from './pointRotate';

/**
 * foo
 * @param {Array<CoordinateLike>} points
 * @param {Parameters<pointRotate>[1]} around
 * @param {Parameters<pointRotate>[2]} degrees
 * @param {Parameters<pointRotate>[3]} [options]
 * @returns {Array<Coordinate>}
 */
export function pointsRotate(
	points,
	around,
	degrees,
	options = {},
) {
	const out = [];
	for (const point of points) {
		out.push(pointRotate(point, around, degrees, options));
	}
	return out;
}
