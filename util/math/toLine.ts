import type { Line, LineLike } from '../types.d.ts';

import { toCoordinate } from './toCoordinate.ts';

export function toLine(lineLike: LineLike): Line {
	if (`begin` in lineLike) {
		return lineLike;
	}

	const [begin, end] = lineLike;

	return {
		begin: toCoordinate(begin),
		end: toCoordinate(end as [number, number]),
	};
}
