/**
 * @import { Coordinate, CoordinateLike } from './types.d';
 */

/**
 * Converts a tuple of 2 numbers (or a string in `x,y` notation) to a Coordinate.
 * Using `Array<number>` because otherwise keeps requiring we specify `as [number, number]`
 * @param {CoordinateLike | string} coordinateLike
 * @returns {Coordinate}
 */
export function toCoordinate(coordinateLike) {
	if (typeof coordinateLike === `string`) {
		const [x, y] = coordinateLike.split(/[, ]+/).map(Number);
		return { x, y };
	}
	if (Array.isArray(coordinateLike)) {
		return {
			x: coordinateLike[0],
			y: coordinateLike[1],
		};
	}
	return coordinateLike;
}
