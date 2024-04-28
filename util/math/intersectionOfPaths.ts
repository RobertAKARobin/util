import type { Coordinate, PathLike } from '../types.d.ts';
import { roundTo } from './roundTo.ts';

import { slope } from './slope.ts';
import { toPath } from './toPath.ts';
import { yOffset } from './yOffset.ts';

/**
 * Find the intersection of two straight lines
 * TODO3: Can make more efficient, but like the readability
 */
export function intersectionOfPaths(...paths: Array<PathLike>): Coordinate | undefined {
	const pathA = toPath(paths[0]);
	const pathB = toPath(paths[1]);

	const slopeA = slope(pathA);
	const slopeB = slope(pathB);

	if (isNaN(slopeA) || isNaN(slopeB) || slopeA === slopeB) {
		return undefined;
	}

	const yOffsetA = yOffset(pathA);
	const yOffsetB = yOffset(pathB);

	let x = (yOffsetB - yOffsetA) / (slopeA - slopeB);
	x = roundTo(x, 12); // Account for float fragments
	if (
		(x < pathA.begin.x && x < pathB.begin.x)
		|| (x > pathA.end.x && x > pathB.end.x)
	) {
		return undefined;
	}

	const y = (slopeA * x) + yOffsetA;
	if (
		(y < pathA.begin.y && y < pathB.begin.y)
		|| (y > pathA.end.y && y > pathB.end.y)
	) {
		return undefined;
	}

	return { x, y };
}
