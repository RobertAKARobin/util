/**
 * @import { LineLike } from '../types.d';
 */

import { getSlope } from './slope';
import { toLine } from './toLine';

/**
 * Get the Y-offset of a given line
 * @param {LineLike} lineLike
 * @returns {number}
 */
export function getYOffset(lineLike) {
	const path = toLine(lineLike);
	const pathSlope = getSlope(path);
	if (isNaN(pathSlope)) {
		return path.begin.y;
	}
	return path.begin.y - (pathSlope * path.begin.x);
}
