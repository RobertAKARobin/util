import type { PathLike } from '../types.d.ts';

import { toPath } from './toPath.ts';

export function distance(pathLike: PathLike): number {
	const path = toPath(pathLike);
	return Math.hypot(path.end.x - path.begin.x, path.end.y - path.begin.y);
}
