import { test } from '../spec/index';

import { pointsAreDifferent } from './pointsAreDifferent';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(pointsAreDifferent([0, 0], [1, 0])));
	$.assert(x => x(pointsAreDifferent([0, 0], [0, 0])) === false);
	$.assert(x => x(pointsAreDifferent([1, 0], [0, 0], [1, 0])) === false);
	$.assert(x => x(pointsAreDifferent([1, 0], [0, 0], [0, 1])));
});
