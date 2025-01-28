import { test } from '../spec/index';

import { getDistance } from './distance';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(getDistance([{ x: 0, y: 0 }, { x: 3, y: 4 }])) === 5);
	$.assert(x => x(getDistance([{ x: 0, y: 0 }, { x: -3, y: 4 }])) === 5);
	$.assert(x => x(getDistance([{ x: 0, y: 0 }, { x: -3, y: -4 }])) === 5);
	$.assert(x => x(getDistance([[0, 0], [3, 4], [-3, -4]])) === 15);
});
