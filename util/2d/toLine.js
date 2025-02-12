/**
 * @import { Line, LineLike } from './types.d';
 */

import { toCoordinate } from './toCoordinate.js';

/**
 * Returns a line made from the first and last of the given points
 * @param {LineLike} lineLike
 * @returns {Line}
 */
export function toLine(lineLike) {
	if (`begin` in lineLike) {
		return lineLike;
	}

	const begin = lineLike[0];
	const end = lineLike[lineLike.length - 1];

	return {
		begin: toCoordinate(begin),
		end: toCoordinate(end),
	};
}
