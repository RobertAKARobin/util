import { test } from '../spec/index.js';

import { preciseTo } from './preciseTo.js';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(preciseTo(Math.PI, 0)) === 3);
	$.assert(x => x(preciseTo(Math.PI, 1)) === 3.1);
	$.assert(x => x(preciseTo(Math.PI, 2)) === 3.14);
	$.assert(x => x(preciseTo(Math.PI, 3)) === 3.142);
	$.assert(x => x(preciseTo(Math.PI, 11)) === 3.14159265359);
});
