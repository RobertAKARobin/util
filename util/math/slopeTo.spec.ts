import { test } from '../spec/index.ts';

import { slopeTo } from './slopeTo.ts';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(slopeTo([[0, 0], [4, 4]])) === 45);
	$.assert(x => x(slopeTo([[0, 0], [-4, 4]])) === 315);
	$.assert(x => x(Number.isNaN(slopeTo([[0, 0], [0, 0]]))));
	$.assert(x => x(Number.isNaN(slopeTo([[3, 4], [3, 4]]))));
	$.assert(x => x(slopeTo([[3, 4], [4, 4]])) === 0);
	$.assert(x => x(slopeTo([[4, 4], [3, 4]])) === 180);
	$.assert(x => x(slopeTo([[3, 4], [3, 5]])) === 90);
	$.assert(x => x(slopeTo([[3, 5], [3, 4]])) === 270);
});
