import type { Bezier } from '../types.d.ts';
import { test } from '../spec/index.ts';

import { bezierPoint } from './bezierPoint.ts';
import segments from '../mock/segments.json';

export const spec = test(`bezierPoint`, $ => {
	const curves = segments.filter(segment => segment.length > 2) as Array<Bezier>;

	$.assert(x => x(bezierPoint(0, ...curves[0]).x) === 50);
	$.assert(x => x(bezierPoint(0, ...curves[0]).y) === 5);
	$.assert(x => x(bezierPoint(1, ...curves[0]).x) === 50);
	$.assert(x => x(bezierPoint(1, ...curves[0]).y) === 50);

	$.assert(x => x(bezierPoint(0, ...curves[1]).x) === 50);
	$.assert(x => x(bezierPoint(0, ...curves[1]).y) === 50);
	$.assert(x => x(bezierPoint(1, ...curves[1]).x) === 95);
	$.assert(x => x(bezierPoint(1, ...curves[1]).y) === 50);

	$.assert(x => x(bezierPoint(0, ...curves[2]).x) === 95);
	$.assert(x => x(bezierPoint(0, ...curves[2]).y) === 70);
	$.assert(x => x(bezierPoint(1, ...curves[2]).x) === 5);
	$.assert(x => x(bezierPoint(1, ...curves[2]).y) === 80);
	// TODO3: Find a way to test midpoints
});
