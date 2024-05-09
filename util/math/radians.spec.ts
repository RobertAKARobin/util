import { test } from '../spec/index.ts';

import { radiansFrom, radiansTo } from './radians.ts';

export const spec = test(`radians`, $ => {
	$.assert(x => x(radiansTo(Math.PI)) === 180);
	$.assert(x => x(radiansFrom(180)) === Math.PI);
	$.assert(x => x(radiansFrom(540)) === Math.PI);
	$.assert(x => x(radiansFrom(-180)) === Math.PI);

	$.assert(x => x(radiansTo(Math.PI / 4)) === 45);
	$.assert(x => x(radiansFrom(45)) === x(Math.PI / 4));
	$.assert(x => x(radiansFrom(-45)) === x((7 * Math.PI) / 4));
});
