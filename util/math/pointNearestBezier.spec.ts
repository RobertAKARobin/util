import { test } from '../spec/index.ts';

import type { Bezier, CoordinateLike, Segment } from '../types.d.ts';
import { pointNearestBezier } from './pointNearestBezier.ts';
import { pointToString } from './pointToString.ts';
import segments from '../mock/segments.json';

export const spec = test(`pointNearestBezier`, $ => {
	let segment: Segment;

	const pointNearest = (target: CoordinateLike, tolerance: number) => {
		const point = pointNearestBezier(target, segment as Bezier, tolerance);
		return pointToString(point);
	};

	segment = segments[1];
	$.assert(x => x(pointNearest([50, 0], 1)) === `50,5`);
	$.assert(x => x(pointNearest([51, 0], 1)) === `50,5`);
	$.assert(x => x(pointNearest([50, 5], 1)) === `50,5`);
	$.assert(x => x(pointNearest([60, 0], 1)) === `50,5`);
	$.assert(x => x(pointNearest([60, 10], 1)) === `50,5`);
	$.assert(x => x(pointNearest([60, 30], 1)) === `41,31`);
	$.assert(x => x(pointNearest([50, 45], 1)) === `47,47`);
	$.assert(x => x(pointNearest([40, 59], 1)) === `49,49`);

	segment = segments[4];
	$.assert(x => x(pointNearest([44, 95], 1)) === `44,93`);
});
