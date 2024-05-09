import { test } from '../spec/index.ts';

import type { Bezier, CoordinateLike, Segment } from '../types.d.ts';
import { pointNearestBezier } from './pointNearestBezier.ts';
import { pointToString } from './pointToString.ts';
import segments from '../mock/segments.json';

export const spec = test(import.meta.url, $ => {
	let segment: Segment;

	const pointNearest = (target: CoordinateLike) => {
		const point = pointNearestBezier(target, segment as Bezier);
		return pointToString(point);
	};

	segment = segments[1];
	$.assert(x => x(pointNearest([50, 0])) === `50,5`);
	$.assert(x => x(pointNearest([51, 0])) === `50,5`);
	$.assert(x => x(pointNearest([50, 5])) === `50,5`);
	$.assert(x => x(pointNearest([50, 6])) === `49,6`);
	$.assert(x => x(pointNearest([50, 7])) === `49,7`);
	$.assert(x => x(pointNearest([60, 0])) === `50,5`);
	$.assert(x => x(pointNearest([60, 10])) === `49,6`);
	$.assert(x => x(pointNearest([60, 30])) === `41,31`);
	$.assert(x => x(pointNearest([50, 45])) === `47,47`);
	$.assert(x => x(pointNearest([40, 59])) === `49,49`);

	segment = segments[4];
	$.assert(x => x(pointNearest([44, 95])) === `43,93`);
});
