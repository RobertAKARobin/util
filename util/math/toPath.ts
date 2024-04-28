import type { Coordinate, Path } from '../types.d.ts';

import { toCoordinate } from './toCoordinate.ts';

export function toPath(arg: Array<Array<number> | Coordinate> | Path): Path {
	if (`begin` in arg) {
		return arg;
	}

	const [begin, end] = arg;

	return {
		begin: toCoordinate(begin),
		end: toCoordinate(end as [number, number]),
	};
}
