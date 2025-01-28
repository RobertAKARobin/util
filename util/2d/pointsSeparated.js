import type { Coordinate, CoordinateLike } from '../types.d';

import { pointsAreDifferent } from './pointsAreDifferent';
import { toCoordinate } from './toCoordinate';

/**
 * Given a list of points, returns a new list with overlapping adjacent points removed
 */
export function pointsSeparated(
	...points: Array<CoordinateLike>
) {
	const out = [] as Array<Coordinate>;
	for (let index = 0, length = points.length - 1; index < length; index++) {
		const point = toCoordinate(points[index]);
		if (index === 0) {
			out.push(point);
		}

		const next = toCoordinate(points[index + 1]);
		if (pointsAreDifferent(point, next)) {
			out.push(next);
		}
	}
	return out;
}
