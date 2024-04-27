import type { Coordinate } from '../types.d.ts';

export function toCoordinate(arg: Coordinate | [number, number]) {
	if (Array.isArray(arg)) {
		return {
			x: arg[0],
			y: arg[1],
		};
	}
	return arg;
}
