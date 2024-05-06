import { test } from '../spec/index.ts';

import { pointsAreDifferent } from './pointsAreDifferent.ts';

export const spec = test(`pointsAreDifferent`, $ => {
	$.assert(x => x(pointsAreDifferent([0, 0], [1, 0])));
	$.assert(x => x(pointsAreDifferent([0, 0], [0, 0])) === false);
	$.assert(x => x(pointsAreDifferent([1, 0], [0, 0], [1, 0])) === false);
	$.assert(x => x(pointsAreDifferent([1, 0], [0, 0], [0, 1])));
});
