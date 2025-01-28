import type { Line, LineLike } from '../types.d';

import { toCoordinate } from './toCoordinate';

/**
 * Returns a line made from the first and last of the given points
 */
export function toLine(lineLike: LineLike): Line {
	if (`begin` in lineLike) {
		return lineLike;
	}

	const begin = lineLike[0];
	const end = lineLike[lineLike.length - 1];

	return {
		begin: toCoordinate(begin),
		end: toCoordinate(end as [number, number]),
	};
}
