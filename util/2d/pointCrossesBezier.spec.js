/**
 * @import { Bezier } from './types.d';
 */

import segments from '../mock/segments.json' with { type: 'json' };
import { test } from '../spec/index.js';

import { pointCrossesBezier } from './pointCrossesBezier.js';
import { pointToString } from './pointToString.js';

export const spec = test(import.meta.url, $ => {
	/** @type {Bezier} */
	let bezier;

	bezier = /** @type {Bezier} */(segments[1]);
	$.assert(x => x(pointToString(pointCrossesBezier([60, 5], bezier))) === `50,5`);

	bezier = /** @type {Bezier} */(segments[4]);
	$.assert(x => x(pointToString(pointCrossesBezier([90, 0], bezier))) === `95,70`);
	$.assert(x => x(pointToString(pointCrossesBezier([42, 5], bezier))) === `52,93`);
});
