import { test } from '../spec/index.ts';

import { distance } from './distance.ts';

export const spec = test(`distance`, $ => {
	$.assert(x => x(distance([{ x: 0, y: 0 }, { x: 3, y: 4 }])) === 5);
	$.assert(x => x(distance([{ x: 0, y: 0 }, { x: -3, y: 4 }])) === 5);
	$.assert(x => x(distance([{ x: 0, y: 0 }, { x: -3, y: -4 }])) === 5);
});
