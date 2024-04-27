import type { Coordinate, Path } from '../types.d.ts';

import { toPath } from './toPath.ts';

export function distance(...args: Array<Coordinate | Path | [number, number]>) {
	const path = toPath(...args);
	return Math.hypot(path.end.x - path.begin.x, path.end.y - path.begin.y);
}
