/**
 * @import { CoordinateLike, Segment } from './types.d';
 */

import { getDistance } from './distance';
import { pointsAreDifferent } from './pointsAreDifferent';
import { pointsToAngles } from './pointsToAngles';
import { pointsToMidpoints } from './pointsToMidpoints';
import { toCoordinate } from './toCoordinate';

/**
 * Given a list of segments and a coordinate, find the index of the segment nearest the coordinate
 * @param {CoordinateLike} coordinateLike
 * @param {Array<Segment>} segments
 * @returns {number}
 */
export function segmentNearestPoint(
	coordinateLike,
	...segments
) {
	const target = toCoordinate(coordinateLike);

	const nearestIndexes = /** @type {Set<number>} */(new Set());
	let nearestDistance = Infinity;
	let index = 0;
	for (const segment of segments) {
		const points = [...segment];
		if (points.length === 2) {
			points.splice(1, 0, pointsToMidpoints(points)[0]); // Ensure lines have a midpoint; otherwise the control of a bezier might measure closer
		}

		for (const point of points) {
			const pointDistance = getDistance([target, point]);
			if (pointDistance === nearestDistance) {
				nearestIndexes.add(index);
			} else if (pointDistance < nearestDistance) {
				nearestDistance = pointDistance;
				nearestIndexes.clear();
				nearestIndexes.add(index);
			}
		}
		index += 1;
	}

	if (nearestIndexes.size === 1) {
		return [...nearestIndexes][0];
	}

	let smallestAngleDifference = Infinity;

	/** @type {number | undefined} */
	let nearestIndex;

	for (const index of nearestIndexes) {
		const segment = segments[index];
		const begin = segment[0];
		const end = segment[segment.length - 1];

		if (
			pointsAreDifferent(target, begin) === false
			|| pointsAreDifferent(target, end) === false
		) {
			return index;
		}

		const angles = pointsToAngles(target, begin, end);
		const angleDifference = Math.abs(angles[0] - angles[1]);
		if (angleDifference < smallestAngleDifference) {
			smallestAngleDifference = angleDifference;
			nearestIndex = index;
		}
	}

	return /** @type {number} */(nearestIndex);
}
