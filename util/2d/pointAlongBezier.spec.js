/**
 * @import { Bezier } from './types.d';
 */

import { test } from '../spec/index.js';

import { pointAlongBezier } from './pointAlongBezier.js';
import { pointToString } from './pointToString.js';
import segments from '../mock/segments.json' with { type: 'json' };

export const spec = test(import.meta.url, $ => {
	const bezier = /** @type {Bezier} */(segments[4]);

	$.assert(x => x(pointToString(pointAlongBezier([0, 100], bezier))) === `5,80`);
	$.assert(x => x(pointToString(pointAlongBezier([0, 60], bezier))) === `5,80`);
	$.assert(x => x(pointToString(pointAlongBezier([20, 100], bezier))) === `20,88`);
	$.assert(x => x(pointToString(pointAlongBezier([50, 100], bezier))) === `50,93`);
	$.assert(x => x(pointToString(pointAlongBezier([100, 100], bezier))) === `95,70`);
});
