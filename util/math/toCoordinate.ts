import type { Coordinate, CoordinateLike } from '../types.d.ts';

/**
 * Converts a tuple of 2 numbers to a Coordinate. Using `Array<number>` because otherwise keeps requiring we specify `as [number, number]`
 */
export function toCoordinate(coordinateLike: CoordinateLike): Coordinate {
	if (Array.isArray(coordinateLike)) {
		return {
			x: coordinateLike[0],
			y: coordinateLike[1],
		};
	}
	return coordinateLike;
}
