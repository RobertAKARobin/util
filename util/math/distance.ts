import type { Coordinate, Path } from '../types.d.ts';

import { toPath } from './toPath.ts';

export function distance(arg: Array<Array<number> | Coordinate> | Path) {
	const path = toPath(arg);
	return Math.hypot(path.end.x - path.begin.x, path.end.y - path.begin.y);
}
