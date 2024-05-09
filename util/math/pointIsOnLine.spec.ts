import { test } from '../spec/index.ts';

import { pointIsOnLine } from './pointIsOnLine.ts';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(pointIsOnLine([3, 9], [[3, 9], [6, 13]])));
	$.assert(x => x(pointIsOnLine([3, 9], [[3, 9], [6, 14]])));

	$.assert(x => x(pointIsOnLine([3, 4], [[0, 0], [6, 8]])));
	$.assert(x => x(pointIsOnLine([3, 4], [[0, 0], [6, 9]])) === false);

	$.assert(x => x(pointIsOnLine([3, 4], [[0, 0]])) === false);
	$.assert(x => x(pointIsOnLine([3, 4], [[3, 4]])) === true);
});
