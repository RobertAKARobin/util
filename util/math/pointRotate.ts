import type { Coordinate, CoordinateLike } from '../types.d.ts';
import { preciseTo } from './preciseTo.ts';
import { radiansFrom } from './radians.ts';
import { toCoordinate } from './toCoordinate.ts';

export function pointRotate(
	coordinateLike: CoordinateLike,
	around: CoordinateLike,
	angle: number,
	options: {
		precision?: number;
		unit?: `degree` | `radian`;
	} = {}
) {
	const target = toCoordinate(coordinateLike);
	const relativeTo = toCoordinate(around);
	const precision = options.precision ?? 1;
	const unit = options.unit ?? `degree`;

	const origin: Coordinate = {
		x: (target.x - relativeTo.x),
		y: (target.y - relativeTo.y),
	};
	const cosine = Math.cos(unit === `degree` ? radiansFrom(angle) : angle);
	const sine = Math.sin(unit === `degree` ? radiansFrom(angle) : angle);
	const result = {
		x: preciseTo((cosine * origin.x) + (sine * origin.y) + relativeTo.x, precision),
		y: preciseTo((cosine * origin.y) - (sine * origin.x) + relativeTo.y, precision),
	};
	return result;
}
