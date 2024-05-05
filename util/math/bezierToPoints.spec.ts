import type { Bezier } from '../types.d.ts';
import { test } from '../spec/index.ts';

import { bezierToPoints } from './bezierToPoints.ts';
import segments from '../mock/segments.json';

export const spec = test(`bezierPoint`, $ => {
	const curve = segments[1] as Bezier;
	const points = bezierToPoints(...curve);

	$.assert(x => x(points.length) === 11);

	$.assert(x => x(points[0].x) === 50);
	$.assert(x => x(points[0].y) === 5);

	$.assert(x => x(points[5].x) === 42.5);
	$.assert(x => x(points[5].y) === 20);

	$.assert(x => x(points[10].x) === 50);
	$.assert(x => x(points[10].y) === 50);
});
