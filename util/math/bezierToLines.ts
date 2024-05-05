import type { Bezier, Coordinate, Line } from '../types.d.ts';

import { bezierToPoints } from './bezierToPoints.ts';
import { constrain } from './constrain.ts';
import { distance } from './distance.ts';
import { pointsToLines } from './pointsToLines.ts';

/**
 * Converts a bezier to a series of lines, where the mean distance of the lines is the given tolerance
 */
export function bezierToLines(
	begin: Coordinate,
	beginHandle: Coordinate,
	endHandle: Coordinate,
	end: Coordinate,
	targetTolerance = 5,
): Array<Line> {
	const bezier = [begin, beginHandle, endHandle, end] as Bezier;
	const distanceRough = distance(bezier);
	const tolerance = constrain(Number.MIN_VALUE, targetTolerance, distanceRough);
	const progress = tolerance / distanceRough;
	const points = bezierToPoints(...bezier, progress);
	const lines = pointsToLines(points);
	return lines;
}
