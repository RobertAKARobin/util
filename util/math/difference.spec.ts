import { test } from '../spec/index.ts';

import { getDifference } from './difference.ts';

export const spec = test(`constrain`, $ => {
	$.assert(x => x(getDifference(3, 9)) === 6);
	$.assert(x => x(getDifference(3, 9)) === 6);
	$.assert(x => x(getDifference(-3, 9)) === 12);
	$.assert(x => x(getDifference(-3, -9)) === 6);
	$.assert(x => x(getDifference(0, 0)) === 0);
	$.assert(x => x(getDifference(0, Math.PI)) === Math.PI);
});
