import type { LineLike } from '../types.d';

import { getSlope } from './slope';
import { toLine } from './toLine';

export function getYOffset(lineLike: LineLike) {
	const path = toLine(lineLike);
	const pathSlope = getSlope(path);
	if (isNaN(pathSlope)) {
		return path.begin.y;
	}
	return path.begin.y - (pathSlope * path.begin.x);
}
