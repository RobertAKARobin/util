import type { Coordinate, LineLike } from '../types.d.ts';
import { toCoordinate } from './toCoordinate.ts';

/**
 * Returns a positive number representing the total distance between points
 */
export function getDistance(input: Array<Coordinate> | LineLike): number {
	const points = `begin` in input
		? [input.begin, input.end]
		: input;

	let distance = 0;
	let previous!: Coordinate;
	for (const entry of points) {
		const point = toCoordinate(entry);
		if (previous !== undefined) {
			distance += Math.hypot(point.x - previous.x, point.y - previous.y);
		}

		previous = point;
	}

	return distance;
}
