import type { Coordinate, CoordinateLike } from '../types.d.ts';

import { pointRotate } from './pointRotate.ts';

export function pointsRotate(
	points: Array<CoordinateLike>,
	around: CoordinateLike,
	degrees: number,
	options: {
		precision?: number;
		unit?: `degree` | `radian`;
	} = {},
) {
	const out = [] as Array<Coordinate>;
	for (const point of points) {
		out.push(pointRotate(point, around, degrees, options));
	}
	return out;
}
