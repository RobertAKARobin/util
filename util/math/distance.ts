import type { PathLike } from '../types.d.ts';

import { toPath } from './toPath.ts';

/**
 * Returns a positive number representing the distance between 2 points
 */
export function distance(pathLike: PathLike): number {
	const path = toPath(pathLike);
	return Math.hypot(path.end.x - path.begin.x, path.end.y - path.begin.y);
}
