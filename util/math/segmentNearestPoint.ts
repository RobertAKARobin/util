import type { CoordinateLike, Segment } from '../types.d.ts';
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
	let nearestDistance = Infinity;
	let nearestIndex!: number;
	let index = 0;
	for (const segment of segments) {
		for (const point of segment) {
			const pointDistance = distance([coordinate, point]);
			if (pointDistance < nearestDistance) {
				nearestDistance = pointDistance;
				nearestIndex = index;
			}
		}
		index += 1;
	}

	return nearestIndex;
}
