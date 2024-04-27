import type { Coordinate, Path } from '../types.d.ts';

import { toCoordinate } from './toCoordinate.ts';

export function toPath(...args: Array<Coordinate | Path | [number, number]>) {
	if (`begin` in args[0]) {
		return args[0];
	}

	const [begin, end] = args;

	return {
		begin: toCoordinate(begin),
		end: toCoordinate(end as [number, number]),
	};
}
