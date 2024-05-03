import type { LineLike } from '../types.d.ts';

import { slope } from './slope.ts';
import { toLine } from './toLine.ts';

export function yOffset(lineLike: LineLike) {
	const path = toLine(lineLike);
	const pathSlope = slope(path);
	return path.begin.y - (pathSlope * path.begin.x);
}
