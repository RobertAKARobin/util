import type { PathLike } from '../types.d.ts';

import { slope } from './slope.ts';
import { toPath } from './toPath.ts';

export function yOffset(pathLike: PathLike) {
	const path = toPath(pathLike);
	const pathSlope = slope(path);
	return path.begin.y - (pathSlope * path.begin.x);
}
