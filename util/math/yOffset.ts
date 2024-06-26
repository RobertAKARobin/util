import type { LineLike } from '../types.d.ts';

import { getSlope } from './slope.ts';
import { toLine } from './toLine.ts';

export function getYOffset(lineLike: LineLike) {
	const path = toLine(lineLike);
	const pathSlope = getSlope(path);
	if (isNaN(pathSlope)) {
		return path.begin.y;
	}
	return path.begin.y - (pathSlope * path.begin.x);
}
