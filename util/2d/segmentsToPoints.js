import type { Coordinate, Segment } from '../types.d';

import { pointsAreDifferent } from './pointsAreDifferent';

export function segmentsToPoints(
	segments: Array<Segment>,
	options: {
		overlap?: boolean;
	} = {},
) {
	const hasOverlap = options.overlap ?? false;

	const points = segments.flat();
	if (hasOverlap) {
		return points;
	}

	const out = [] as Array<Coordinate>;
	let last = {} as Coordinate;
	for (const point of points) {
		if (pointsAreDifferent(point, last)) {
			out.push(point);
		}
		last = point;
	}
	return out;
}
