import type { Bezier, CoordinateLike, LineLike, Segment } from '../types.d.ts';
import { pointCrossesBezier } from './pointCrossesBezier.ts';
import { pointNearestLine } from './pointNearestLine.ts';
import { segmentNearestPoint } from './segmentNearestPoint.ts';
import { toCoordinate } from './toCoordinate.ts';

/**
 * Given a target coordinate and a path (which is an array of segments), approximate the point on the path most aligned to the target, e.g. closest to a line extending perpendicularly from the current segment
 */
export function pointAlongPath(
	coordinateLike: CoordinateLike,
	path: Array<Segment>,
	tolerance = 1,
) {
	const target = toCoordinate(coordinateLike);
	const segmentIndex = segmentNearestPoint(target, ...path);
	const segment = path[segmentIndex];
	if (segment.length === 4) {
		return pointCrossesBezier(target, segment as Bezier, tolerance);
	}
	return pointNearestLine(target, segment as LineLike);
}
