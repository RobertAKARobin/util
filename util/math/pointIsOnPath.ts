import type { CoordinateLike, PathLike } from '../types.d.ts';

import { slope } from './slope.ts';
import { toCoordinate } from './toCoordinate.ts';
import { toPath } from './toPath.ts';
import { yOffset } from './yOffset.ts';

/**
 * Returns whether the given coordinate is on the given path.
 * TODO3: Add tolerance
 */
export function pointIsOnPath(coordinateLike: CoordinateLike, pathLike: PathLike): boolean {
	const point = toCoordinate(coordinateLike);
	const path = toPath(pathLike);

	const pathSlope = slope(path);
	const pathYOffset = yOffset(path);

	const expectedY = (pathSlope * point.x) + pathYOffset;
	return expectedY === point.y;
}
