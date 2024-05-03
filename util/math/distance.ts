import type { LineLike } from '../types.d.ts';

import { toLine } from './toLine.ts';

/**
 * Returns a positive number representing the distance between 2 points
 */
export function distance(lineLike: LineLike): number {
	const { begin, end } = toLine(lineLike);
	return Math.hypot(end.x - begin.x, end.y - begin.y);
}
