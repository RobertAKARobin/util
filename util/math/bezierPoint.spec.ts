import type { Bezier } from '../types.d.ts';
import { test } from '../spec/index.ts';

import { bezierPoint } from './bezierPoint.ts';
import segments from '../mock/segments.json';

export const spec = test(import.meta.url, $ => {
	const curves = segments.filter(segment => segment.length > 2) as Array<Bezier>;

	$.assert(x => x(bezierPoint(...curves[0], 0).x) === 50);
	$.assert(x => x(bezierPoint(...curves[0], 0).y) === 5);
	$.assert(x => x(bezierPoint(...curves[0], 1).x) === 50);
	$.assert(x => x(bezierPoint(...curves[0], 1).y) === 50);
	$.assert(x => x(bezierPoint(...curves[1], 0).x) === 50);
	$.assert(x => x(bezierPoint(...curves[1], 0).y) === 50);
	$.assert(x => x(bezierPoint(...curves[1], 1).x) === 95);
	$.assert(x => x(bezierPoint(...curves[1], 1).y) === 50);
	$.assert(x => x(bezierPoint(...curves[2], 0).x) === 95);
	$.assert(x => x(bezierPoint(...curves[2], 0).y) === 70);
	$.assert(x => x(bezierPoint(...curves[2], 1).x) === 5);
	$.assert(x => x(bezierPoint(...curves[2], 1).y) === 80);
	// TODO3: Find a way to test midpoints
});
