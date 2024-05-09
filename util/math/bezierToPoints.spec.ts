import type { Bezier } from '../types.d.ts';
import { test } from '../spec/index.ts';

import { bezierToPoints } from './bezierToPoints.ts';
import segments from '../mock/segments.json';

export const spec = test(import.meta.url, $ => {
	const curve = segments[1] as Bezier;
	let points = bezierToPoints(...curve, .1);

	$.assert(x => x(points.length) === x(Math.ceil(1 / .1) + 1));

	$.assert(x => x(points[0].x) === 50);
	$.assert(x => x(points[0].y) === 5);

	$.assert(x => x(points[5].x) === 42.5);
	$.assert(x => x(points[5].y) === 20);

	$.assert(x => x(points[10].x) === 50);
	$.assert(x => x(points[10].y) === 50);

	points = bezierToPoints(...curve, .11);
	$.assert(x => x(points.length) === x(Math.ceil(1 / .11) + 1));
	$.assert(x => x(points[0].x) === 50);
	$.assert(x => x(points[0].y) === 5);

	$.assert(x => x(points[points.length - 1].x) === 50);
	$.assert(x => x(points[points.length - 1].y) === 50);
});
