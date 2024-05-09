import type { LineLike } from '../types.d.ts';

import { toLine } from './toLine.ts';

export function getSlope(lineLike: LineLike) {
	const path = toLine(lineLike);
	if (path.end.x === path.begin.x) {
		if (path.end.y === path.begin.y) {
			return NaN;
		} if (path.end.y > path.begin.y) {
			return Infinity;
		}
		return -Infinity;
	}
	return (path.end.y - path.begin.y) / (path.end.x - path.begin.x);
}
