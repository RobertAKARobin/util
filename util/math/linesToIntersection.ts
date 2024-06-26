import type { Coordinate, LineLike } from '../types.d.ts';
import { roundTo } from './roundTo.ts';

import { getSlope } from './slope.ts';
import { getYOffset } from './yOffset.ts';
import { toLine } from './toLine.ts';

/**
 * Find the intersection of two straight lines
 * TODO3: Can make more efficient, but like the readability
 */
export function linesToIntersection(...lines: Array<LineLike>): Coordinate | undefined {
	const lineA = toLine(lines[0]);
	const lineB = toLine(lines[1]);

	const slopeA = getSlope(lineA);
	const slopeB = getSlope(lineB);

	if (isNaN(slopeA) || isNaN(slopeB) || slopeA === slopeB) {
		return undefined;
	}

	const yOffsetA = getYOffset(lineA);
	const yOffsetB = getYOffset(lineB);

	let x = (yOffsetB - yOffsetA) / (slopeA - slopeB);
	x = roundTo(x); // Account for float fragments
	if (
		(x < lineA.begin.x && x < lineB.begin.x)
		|| (x > lineA.end.x && x > lineB.end.x)
	) {
		return undefined;
	}

	const y = (slopeA * x) + yOffsetA;
	if (
		(y < lineA.begin.y && y < lineB.begin.y)
		|| (y > lineA.end.y && y > lineB.end.y)
	) {
		return undefined;
	}

	return { x, y };
}
