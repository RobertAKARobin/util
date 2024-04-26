import { test } from '../spec/index.ts';

import { distance } from './distance.ts';

export const spec = test(`distance`, $ => {
	$.assert(x => x(distance([0, 0], [3, 4])) === 5);
	$.assert(x => x(distance([0, 0], [-3, 4])) === 5);
	$.assert(x => x(distance([0, 0], [-3, -4])) === 5);
});
