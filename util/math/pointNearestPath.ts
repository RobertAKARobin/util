import type { Bezier, CoordinateLike, LineLike, Segment } from '../types.d.ts';
import { pointNearestBezier } from './pointNearestBezier.ts';
import { pointNearestLine } from './pointNearestLine.ts';
import { segmentNearestPoint } from './segmentNearestPoint.ts';
import { toCoordinate } from './toCoordinate.ts';

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
