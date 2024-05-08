import { test } from '../spec/index.ts';

import { roundTo } from './roundTo.ts';

export const spec = test(`roundTo`, $ => {
	$.assert(x => x(isNaN(roundTo(Math.PI, 0))));
	$.assert(x => x(roundTo(Math.PI)) === 3);
	$.assert(x => x(roundTo(Math.PI, 1)) === 3);
	$.assert(x => x(roundTo(Math.PI, 2)) === 4);
	$.assert(x => x(roundTo(Math.PI, 3)) === 3);
	$.assert(x => x(roundTo(Math.PI, 4)) === 4);
	$.assert(x => x(roundTo(Math.PI, 5)) === 5);
	$.assert(x => x(roundTo(Math.PI, 6)) === 6);
	$.assert(x => x(roundTo(Math.PI, 7)) === 0);

	$.assert(x => x(roundTo(Math.PI, .1)) === 3.1);
	$.assert(x => x(roundTo(Math.PI, .01)) === 3.14);
	$.assert(x => x(roundTo(Math.PI, .001)) === 3.142);
	$.assert(x => x(roundTo(Math.PI, .0001)) === 3.1416);

	$.assert(x => x(isNaN(roundTo(0, 0))));
	$.assert(x => x(roundTo(0, 1)) === 0);

	$.assert(x => x(roundTo(Math.PI * 1000)) === 3142);
	$.assert(x => x(roundTo(Math.PI * 1000, 1)) === 3142);
	$.assert(x => x(roundTo(Math.PI * 1000, .1)) === 3141.6);
	$.assert(x => x(roundTo(Math.PI * 1000, .5)) === 3141.5);
	$.assert(x => x(roundTo(Math.PI * 1000, .01)) === 3141.59);
	$.assert(x => x(roundTo(Math.PI * 1000, .05)) === 3141.6);
	$.assert(x => x(roundTo(Math.PI * 1000, .001)) === 3141.593);
	$.assert(x => x(roundTo(Math.PI * 1000, .005)) === 3141.595);

	$.assert(x => x(roundTo(Math.PI * 1000, 10)) === 3140);
	$.assert(x => x(roundTo(Math.PI * 1000, 100)) === 3100);
	$.assert(x => x(roundTo(Math.PI * 1000, 1000)) === 3000);
	$.assert(x => x(roundTo(Math.PI * 1000, 10000)) === 0);

	$.assert(x => x(roundTo(Math.PI * 1000, 2)) === 3142);
	$.assert(x => x(roundTo(Math.PI * 1000, 3)) === 3141);
	$.assert(x => x(roundTo(Math.PI * 1000, 4)) === 3140);
});
