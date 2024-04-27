import type { Coordinate, Path } from '../types.d.ts';

import { toPath } from './toPath.ts';

export function slope(...args: Array<Coordinate | Path | [number, number]>) {
	const path = toPath(...args);
	return (path.end.y - path.begin.y) / (path.end.x - path.begin.x);
}
