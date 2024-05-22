import { test } from '../spec/index.ts';

import { isPowerOf } from './isPowerOf.ts';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(isPowerOf(2, 0)) === false);
	$.assert(x => x(isPowerOf(2, 1)) === true);
	$.assert(x => x(isPowerOf(2, 2)) === true);
	$.assert(x => x(isPowerOf(2, 4)) === true);
	$.assert(x => x(isPowerOf(2, 255)) === false);
	$.assert(x => x(isPowerOf(2, 256)) === true);

	$.assert(x => x(isPowerOf(3, 0)) === false);
	$.assert(x => x(isPowerOf(3, 1)) === true);
	$.assert(x => x(isPowerOf(3, 3)) === true);
	$.assert(x => x(isPowerOf(3, 9)) === true);
	$.assert(x => x(isPowerOf(3, 10)) === false);
	$.assert(x => x(isPowerOf(3, 80)) === false);
	$.assert(x => x(isPowerOf(3, 81)) === true);
	$.assert(x => x(isPowerOf(3, 82)) === false);
});
