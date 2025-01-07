import type { CoordinateLike } from '../types.d';

import { pointToString } from './pointToString';
import { toCoordinate } from './toCoordinate';

/**
 * Returns whether all the given points are unique.
 */
export function pointsAreDifferent(
	...points: Array<CoordinateLike>
) {
	const used = {} as Record<string, boolean>;
	for (const coordinateLike of points) {
		const point = toCoordinate(coordinateLike);
		const id = pointToString(point);
		if (used[id]) {
			return false;
		}
		used[id] = true;
	}
	return true;
}
