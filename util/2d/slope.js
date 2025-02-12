/**
 * @import { LineLike } from './types.d';
 */

import { toLine } from './toLine.js';

/**
 * Returns the slope of a line
 * @param {LineLike} lineLike
 * @returns {number}
 */
export function getSlope(lineLike) {
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
