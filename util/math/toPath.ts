import type { Path, PathLike } from '../types.d.ts';

import { toCoordinate } from './toCoordinate.ts';

export function toPath(pathLike: PathLike): Path {
	if (`begin` in pathLike) {
		return pathLike;
	}

	const [begin, end] = pathLike;

	return {
		begin: toCoordinate(begin),
		end: toCoordinate(end as [number, number]),
	};
}
