/**
 * @import { Coordinate, CoordinateLike } from './types.d';
 */

import { preciseTo } from '../math/preciseTo.js';

import { radiansFrom } from './radians.js';
import { toCoordinate } from './toCoordinate.js';

/**
 * @param {CoordinateLike} coordinateLike
 * @param {CoordinateLike} around
 * @param {number} angle
 * @param {object} [options]
 * @param {number} [options.precision=1]
 * @param {'degree' | 'radian'} [options.unit=`degree`]
 * @returns {Coordinate}
 */
export function pointRotate(
	coordinateLike,
	around,
	angle,
	options = {},
) {
	const target = toCoordinate(coordinateLike);
	const relativeTo = toCoordinate(around);
	const precision = options.precision ?? 1;
	const unit = options.unit ?? `degree`;

	const origin = /** @type {Coordinate} */({
		x: (target.x - relativeTo.x),
		y: (target.y - relativeTo.y),
	});
	const cosine = Math.cos(unit === `degree` ? radiansFrom(angle) : angle);
	const sine = Math.sin(unit === `degree` ? radiansFrom(angle) : angle);
	const result = {
		x: preciseTo((cosine * origin.x) + (sine * origin.y) + relativeTo.x, precision),
		y: preciseTo((cosine * origin.y) - (sine * origin.x) + relativeTo.y, precision),
	};
	return result;
}
