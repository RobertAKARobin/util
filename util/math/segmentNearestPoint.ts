import type { CoordinateLike, Segment } from '../types.d.ts';
import { anglesFromPoints } from './anglesFromPoints.ts';
import { distance } from './distance.ts';
import { toCoordinate } from './toCoordinate.ts';

/**
 * Given a list of segments and a coordinate, find the index of the segment nearest the coordinate
 */
export function segmentNearestPoint(
	target: CoordinateLike,
	...segments: Array<Segment>
) {
	const coordinate = toCoordinate(target);

	const nearestIndexes = new Set<number>();
	let nearestDistance = Infinity;
	let index = 0;
	for (const segment of segments) {
		for (const point of segment) {
			const pointDistance = distance([coordinate, point]);
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
		const angles = anglesFromPoints(coordinate, begin, end);
		const angleDifference = Math.abs(angles[0] - angles[1]);
		if (angleDifference < smallestAngleDifference) {
			smallestAngleDifference = angleDifference;
			nearestIndex = index;
		}
	}

	return nearestIndex;
}
