import type { CoordinateLike, Segment } from '../types.d.ts';
import { getDistance } from './distance.ts';
import { pointsAreDifferent } from './pointsAreDifferent.ts';
import { pointsToAngles } from './pointsToAngles.ts';
import { pointsToMidpoints } from './pointsToMidpoints.ts';
import { toCoordinate } from './toCoordinate.ts';

/**
 * Given a list of segments and a coordinate, find the index of the segment nearest the coordinate
 */
export function segmentNearestPoint(
	coordinateLike: CoordinateLike,
	...segments: Array<Segment>
) {
	const target = toCoordinate(coordinateLike);

	const nearestIndexes = new Set<number>();
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
	let nearestIndex!: number;
	for (const index of nearestIndexes) {
		const segment = segments[index];
		const begin = segment[0];
		const end = segment[segment.length - 1];

		if (!pointsAreDifferent(target, begin) || !pointsAreDifferent(target, end)) {
			return index;
		}

		const angles = pointsToAngles(target, begin, end);
		const angleDifference = Math.abs(angles[0] - angles[1]);
		if (angleDifference < smallestAngleDifference) {
			smallestAngleDifference = angleDifference;
			nearestIndex = index;
		}
	}

	return nearestIndex;
}
