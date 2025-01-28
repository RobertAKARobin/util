import type { Bezier, CoordinateLike, LineLike, Segment } from '../types.d';
import { pointNearestBezier } from './pointNearestBezier';
import { pointNearestLine } from './pointNearestLine';
import { segmentNearestPoint } from './segmentNearestPoint';
import { toCoordinate } from './toCoordinate';

/**
 * Given a target coordinate and a path (which is an array of segments), approximate the point on the path closest to the target
 */
export function pointNearestPath(
	coordinateLike: CoordinateLike,
	path: Array<Segment>,
	tolerance = 1,
) {
	const target = toCoordinate(coordinateLike);
	const segmentIndex = segmentNearestPoint(target, ...path);
	const segment = path[segmentIndex];
	if (segment.length === 4) {
		return pointNearestBezier(target, segment as Bezier, tolerance);
	}
	return pointNearestLine(target, segment as LineLike);
}
