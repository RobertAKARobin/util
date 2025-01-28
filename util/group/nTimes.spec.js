import { test } from '../spec/index';

import { nTimes } from './nTimes';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(nTimes(2, `foo`).join(` `)) === `foo foo`);
	$.assert(x => x(nTimes(3, (nil, index) => index).join(` `)) === `0 1 2`);
	$.assert(x => x(nTimes(3).join(` `)) === `0 1 2`);
});
