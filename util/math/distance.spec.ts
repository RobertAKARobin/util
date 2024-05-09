import { test } from '../spec/index.ts';

import { getDistance } from './distance.ts';

export const spec = test(`distance`, $ => {
	$.assert(x => x(getDistance([{ x: 0, y: 0 }, { x: 3, y: 4 }])) === 5);
	$.assert(x => x(getDistance([{ x: 0, y: 0 }, { x: -3, y: 4 }])) === 5);
	$.assert(x => x(getDistance([{ x: 0, y: 0 }, { x: -3, y: -4 }])) === 5);
	$.assert(x => x(getDistance([[0, 0], [3, 4], [-3, -4]])) === 15);
});
