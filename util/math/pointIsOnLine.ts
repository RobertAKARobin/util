import type { CoordinateLike, LineLike } from '../types.d.ts';

import { getSlope } from './slope.ts';
import { getYOffset } from './yOffset.ts';
import { pointsAreDifferent } from './pointsAreDifferent.ts';
import { toCoordinate } from './toCoordinate.ts';
import { toLine } from './toLine.ts';

/**
 * Returns whether the given coordinate is on the given line.
 * TODO3: Add tolerance
 */
export function pointIsOnLine(coordinateLike: CoordinateLike, lineLike: LineLike): boolean {
	const point = toCoordinate(coordinateLike);
	const line = toLine(lineLike);

	const lineSlope = getSlope(line);

	if (isNaN(lineSlope)) {
		return (pointsAreDifferent(point, line.begin) === false);
	}

	const lineYOffset = getYOffset(line);

	const expectedY = (lineSlope * point.x) + lineYOffset;
	return expectedY === point.y;
}
