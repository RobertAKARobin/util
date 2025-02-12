/**
 * @import { CoordinateLike, LineLike } from './types.d';
 */

import { getSlope } from './slope.js';
import { getYOffset } from './yOffset.js';
import { pointsAreDifferent } from './pointsAreDifferent.js';
import { toCoordinate } from './toCoordinate.js';
import { toLine } from './toLine.js';

/**
 * Returns whether the given coordinate is on the given line.
 * TODO3: Add tolerance
 * @param {CoordinateLike} coordinateLike
 * @param {LineLike} lineLike
 * @returns {boolean}
 */
export function pointIsOnLine(coordinateLike, lineLike) {
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
