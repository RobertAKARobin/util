import type { Bezier } from '../types.d.ts';
import { test } from '../spec/index.ts';

import { pointAlongBezier } from './pointAlongBezier.ts';
import { pointToString } from './pointToString.ts';
import segments from '../mock/segments.json';

export const spec = test(import.meta.url, $ => {
	const bezier = segments[4] as Bezier;

	$.assert(x => x(pointToString(pointAlongBezier([0, 100], bezier))) === `5,80`);
	$.assert(x => x(pointToString(pointAlongBezier([0, 60], bezier))) === `5,80`);
	$.assert(x => x(pointToString(pointAlongBezier([20, 100], bezier))) === `20,88`);
	$.assert(x => x(pointToString(pointAlongBezier([50, 100], bezier))) === `50,93`);
	$.assert(x => x(pointToString(pointAlongBezier([100, 100], bezier))) === `95,70`);
});
