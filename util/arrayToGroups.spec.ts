import { test } from './spec/index.ts';

import { arrayToGroups } from './arrayToGroups.ts';

export const spec = test(`arrayToGroups`, $ => {
	$.assert(x => x(arrayToGroups(2, []).length) === 0);
	$.assert(x => x(arrayToGroups(2, [1]).length) === 1);
	$.assert(x => x(arrayToGroups(2, [1])[0].length) === 1);
	$.assert(x => x(arrayToGroups(2, [1, 2, 3, 4, 5])[0].length) === 2);
	$.assert(x => x(arrayToGroups(2, [1, 2, 3, 4, 5])[1].length) === 2);
	$.assert(x => x(arrayToGroups(2, [1, 2, 3, 4, 5])[2].length) === 1);
	$.assert(x => x(arrayToGroups(2, [1, 2, 3, 4, 5])[1][0]) === 3);
	$.assert(x => x(arrayToGroups(2, [1, 2, 3, 4, 5])[1][1]) === 4);
});
