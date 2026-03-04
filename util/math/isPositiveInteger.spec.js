import { test } from '../spec/index.js';

import { isPositiveInteger } from './isPositiveInteger.js';

export const spec = test(import.meta.url, $ => {
	$.assert(() => isPositiveInteger(-1) === false);
	$.assert(() => isPositiveInteger(-.1) === false);
	$.assert(() => isPositiveInteger(.1) === false);
	$.assert(() => isPositiveInteger(0) === false);
	$.assert(() => isPositiveInteger(Infinity) === false);
	$.assert(() => isPositiveInteger(-Infinity) === false);
	$.assert(() => isPositiveInteger(Math.PI) === false);
	$.assert(() => isPositiveInteger(1) === true);
	$.assert(() => isPositiveInteger(10) === true);
	$.assert(() => isPositiveInteger(Number.MAX_SAFE_INTEGER) === true);
});
