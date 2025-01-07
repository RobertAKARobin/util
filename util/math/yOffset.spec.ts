import { test } from '../spec/index';

import { getYOffset } from './yOffset';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(getYOffset([[0, 0], [1, 1]])) === 0);
	$.assert(x => x(getYOffset([[0, 1], [1, 2]])) === 1);
	$.assert(x => x(getYOffset([[10, 10], [-10, -10]])) === 0);
	$.assert(x => x(getYOffset([[0, 1]])) === 1);
});
