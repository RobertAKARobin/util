import type { LineLike } from '../types.d.ts';

import { toLine } from './toLine.ts';

export function slope(lineLike: LineLike) {
	const path = toLine(lineLike);
	return (path.end.y - path.begin.y) / (path.end.x - path.begin.x);
}
