import type { Coordinate } from '../types.d';

import { preciseTo } from '../math/preciseTo';

import { bezierPoint } from './bezierPoint';

export function bezierToPoints(
	begin: Coordinate,
	beginHandle: Coordinate,
	endHandle: Coordinate,
	end: Coordinate,
	progressPerLine = .1,
): Array<Coordinate> {
	const points = [] as Array<Coordinate>;

	let progress = 0;
	while (true) {
		if (progress > 1) {
			progress = 1;
		}

		const point = bezierPoint(
			begin,
			beginHandle,
			endHandle,
			end,
			progress,
		);
		points.push(point);

		if (progress === 1) {
			break;
		}

		progress = preciseTo(progress + progressPerLine);
	}

	return points;
}
