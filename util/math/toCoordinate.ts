import type { Coordinate } from '../types.d.ts';

/**
 * Converts a tuple of 2 numbers to a Coordinate. Using `Array<number>` because otherwise keeps requiring we specify `as [number, number]`
 */
export function toCoordinate(arg: Array<number> | Coordinate) {
	if (Array.isArray(arg)) {
		return {
			x: arg[0],
			y: arg[1],
		};
	}
	return arg;
}
