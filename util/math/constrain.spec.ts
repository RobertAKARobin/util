import { test } from '../spec/index.ts';

import { constrain } from './constrain.ts';

export const spec = test(`constrain`, $ => {
	$.assert(x => x(constrain(3, 4, 5)) === 4);
	$.assert(x => x(constrain(3, 2, 5)) === 3);
	$.assert(x => x(constrain(3, 6, 5)) === 5);
});
