import type { Coordinate, Path } from '../types.d.ts';

import { toPath } from './toPath.ts';

export function slope(arg: Array<Array<number> | Coordinate> | Path) {
	const path = toPath(arg);
	return (path.end.y - path.begin.y) / (path.end.x - path.begin.x);
}
