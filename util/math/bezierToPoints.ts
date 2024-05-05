import type { Coordinate } from '../types.d.ts';

import { bezierPoint } from './bezierPoint.ts';

export function bezierToPoints(
	begin: Coordinate,
	beginHandle: Coordinate,
	endHandle: Coordinate,
	end: Coordinate,
	progressPerLine = .1
): Array<Coordinate> {
	const points = [] as Array<Coordinate>;

	let progress = 0;
	while (progress <= 1) {
		const point = bezierPoint(
			progress,
			begin,
			beginHandle,
			endHandle,
			end
		);
		points.push(point);
		progress += progressPerLine;
	}

	return points;
}
