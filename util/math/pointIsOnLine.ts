import type { CoordinateLike, LineLike } from '../types.d';

import { getSlope } from './slope';
import { getYOffset } from './yOffset';
import { pointsAreDifferent } from './pointsAreDifferent';
import { toCoordinate } from './toCoordinate';
import { toLine } from './toLine';

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
