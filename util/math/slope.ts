import type { PathLike } from '../types.d.ts';

import { toPath } from './toPath.ts';

export function slope(pathLike: PathLike) {
	const path = toPath(pathLike);
	return (path.end.y - path.begin.y) / (path.end.x - path.begin.x);
}
