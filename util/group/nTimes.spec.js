import { test } from '../spec/index.js';

import { nTimes } from './nTimes.js';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(nTimes(2, `foo`).join(` `)) === `foo foo`);
	$.assert(x => x(nTimes(3, (nil, index) => index).join(` `)) === `0 1 2`);
	$.assert(x => x(nTimes(3).join(` `)) === `0 1 2`);
});
