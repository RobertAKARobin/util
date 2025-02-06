/**
 * @import { Coordinate, Segment } from '../types.d';
 */

import { pointsAreDifferent } from './pointsAreDifferent';

/**
 * Converts an array of segments to an array of points
 * @param {Array<Segment>} segments
 * @param {object} [options]
 * @param {boolean} [options.overlap=false]
 * @returns {Array<Coordinate>}
 */
export function segmentsToPoints(
	segments,
	options = {},
) {
	const hasOverlap = options.overlap ?? false;

	const points = segments.flat();
	if (hasOverlap) {
		return points;
	}

	const out = [];

	/** @type {Coordinate} */
	let last = { x: NaN, y: NaN };
	for (const point of points) {
		if (pointsAreDifferent(point, last)) {
			out.push(point);
		}
		last = point;
	}

	return out;
}
