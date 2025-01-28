import { test } from '../spec/index';

import { pointToString } from './pointToString';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(pointToString([3, 9])) === `3,9`);
	$.assert(x => x(pointToString([9, 3])) === `9,3`);
	$.assert(x => x(pointToString([9, 3, 1])) === `9,3`);
	$.assert(x => x(pointToString([-9, 3, 1])) === `-9,3`);
	$.assert(x => x(pointToString([-9, -3, 1])) === `-9,-3`);
	$.assert(x => x(pointToString([9, -1 / 2])) === `9,-0.5`);
});
