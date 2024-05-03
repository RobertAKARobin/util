import type { CoordinateLike, LineLike } from '../types.d.ts';

import { slope } from './slope.ts';
import { toCoordinate } from './toCoordinate.ts';
import { toLine } from './toLine.ts';
import { yOffset } from './yOffset.ts';

/**
 * Returns whether the given coordinate is on the given line.
 * TODO3: Add tolerance
 */
export function pointIsOnLine(coordinateLike: CoordinateLike, lineLike: LineLike): boolean {
	const point = toCoordinate(coordinateLike);
	const line = toLine(lineLike);

	const lineSlope = slope(line);
	const lineYOffset = yOffset(line);

	const expectedY = (lineSlope * point.x) + lineYOffset;
	return expectedY === point.y;
}
