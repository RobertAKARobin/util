import { test } from '../spec/index.ts';
import { tryCatch } from '../tryCatch.ts';

import { getYOffset } from './yOffset.ts';

export const spec = test(`yOffset`, $ => {
	$.assert(x => x(getYOffset([[0, 0], [1, 1]])) === 0);
	$.assert(x => x(getYOffset([[0, 1], [1, 2]])) === 1);
	$.assert(x => x(getYOffset([[10, 10], [-10, -10]])) === 0);
	$.assert(x => x(tryCatch(() => getYOffset([[0, 1]]))) instanceof TypeError);
});
