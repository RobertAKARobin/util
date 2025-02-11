/**
 * @import { Coordinate, LineLike } from './types.d';
 */

import { toCoordinate } from './toCoordinate';

/**
 * Returns a positive number representing the total distance between points
 * @param {Array<Coordinate> | LineLike} input
 * @returns {number}
 */
export function getDistance(input) {
	const points = `begin` in input
		? [input.begin, input.end]
		: input;

	let distance = 0;

	/** @type {Coordinate | undefined} */
	let previous;

	for (const entry of points) {
		const point = toCoordinate(entry);
		if (previous !== undefined) {
			distance += Math.hypot(point.x - previous.x, point.y - previous.y);
		}

		previous = point;
	}

	return distance;
}
