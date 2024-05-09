import { test } from '../spec/index.ts';

import { getSlope } from './slope.ts';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(getSlope([[0, 0], [3, 4]])) === x(4 / 3));
	$.assert(x => x(getSlope([[0, 0], [4, 4]])) === 1);
	$.assert(x => x(getSlope([[0, 0], [-4, 4]])) === -1);
	$.assert(x => x(Number.isNaN(getSlope([[0, 0], [0, 0]])))); // Can't do `=== NaN` because Javscript is dumb and NaN isn't === to anything, not even NaN
	$.assert(x => x(Number.isNaN(getSlope([[3, 4], [3, 4]]))));
	$.assert(x => x(Object.is(getSlope([[3, 4], [4, 4]]), 0))); // Unfortunately (-0 === 0) is true; https://stackoverflow.com/questions/7223359/are-0-and-0-the-same
	$.assert(x => x(Object.is(getSlope([[4, 4], [3, 4]]), -0)));
	$.assert(x => x(getSlope([[3, 4], [3, 5]])) === Infinity);
	$.assert(x => x(getSlope([[3, 4], [3, 5]])) !== -Infinity);
	$.assert(x => x(getSlope([[3, 5], [3, 4]])) === -Infinity);
	$.assert(x => x(getSlope([[3, 5], [3, 4]])) !== Infinity);
});
