import { test } from '../spec/index.ts';
import { tryCatch } from '../tryCatch.ts';

import { yOffset } from './yOffset.ts';

export const spec = test(`yOffset`, $ => {
	$.assert(x => x(yOffset([[0, 0], [1, 1]])) === 0);
	$.assert(x => x(yOffset([[0, 1], [1, 2]])) === 1);
	$.assert(x => x(yOffset([[10, 10], [-10, -10]])) === 0);
	$.assert(x => x(tryCatch(() => yOffset([[0, 1]]))) instanceof TypeError);
});
