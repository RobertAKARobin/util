import segments from '../mock/segments.json';
import { test } from '../spec/index.ts';

import type { Bezier } from '../types.d.ts';
import { pointCrossesBezier } from './pointCrossesBezier.ts';
import { pointToString } from './pointToString.ts';

export const spec = test(`pointCrossesBezier`, $ => {
	let bezier: Bezier;

	bezier = segments[1] as Bezier;
	$.assert(x => x(pointToString(pointCrossesBezier([60, 5], bezier))) === `50,5`);

	bezier = segments[4] as Bezier;
	$.assert(x => x(pointToString(pointCrossesBezier([90, 0], bezier))) === `95,70`);
	$.assert(x => x(pointToString(pointCrossesBezier([42, 5], bezier))) === `52,93`);
});
