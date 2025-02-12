import { test } from '../spec/index.js';

import { pointRotate } from './pointRotate.js';
import { pointToString } from './pointToString.js';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(pointToString(pointRotate([0, 1], [0, 0], 90))) === `1,0`);
	$.assert(x => x(pointToString(pointRotate([0, 0], [0, 1], 90))) === `-1,1`);
	$.assert(x => x(pointToString(pointRotate([1, 0], [0, 0], 90))) === `0,-1`);
	$.assert(x => x(pointToString(pointRotate([0, 0], [1, 0], 90))) === `1,1`);
	$.assert(x => x(pointToString(pointRotate([0, 1], [1, 0], 90))) === `2,1`);
	$.assert(x => x(pointToString(pointRotate([0, 1], [1, 0], 45))) === `1,1.4`);
	$.assert(x => x(pointToString(pointRotate([0, 1], [1, 0], 180))) === `2,-1`);
	$.assert(x => x(pointToString(pointRotate([0, 1], [1, 0], 360))) === `0,1`);
	$.assert(x => x(pointToString(pointRotate([50, -115], [95, -70], 6.34))) === `45.3,-109.8`);
});
