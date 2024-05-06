import { test } from '../spec/index.ts';

import { radiansFrom, radiansTo } from './radians.ts';
import { roundTo } from './roundTo.ts';

export const spec = test(`radians`, $ => {
	$.assert(x => x(radiansTo(Math.PI, 0)) === 180);
	$.assert(x => x(radiansFrom(180, 2)) === roundTo(Math.PI, 2));

	$.assert(x => x(radiansTo(Math.PI / 4, 0)) === 45);
	$.assert(x => x(radiansFrom(45, 2)) === roundTo(Math.PI / 4, 2));
});
