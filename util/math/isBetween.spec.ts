import { test } from '../spec/index.ts';

import { isBetween } from './isBetween.ts';

export const spec = test(`distance`, $ => {
	$.assert(x => x(isBetween(1, 2, 3)));
	$.assert(x => x(isBetween(1, 3, 2)) === false);
	$.assert(x => x(isBetween(1, 1, 3)) === false);
	$.assert(x => x(isBetween(1, 1, 1)) === false);
	$.assert(x => x(isBetween(1, 1, 1, { inclusive: true })));
	$.assert(x => x(isBetween(1, 1 + 0.00001, 1)) === false);
	$.assert(x => x(isBetween(1, 1 + 0.00001, 1.0001)));
});
