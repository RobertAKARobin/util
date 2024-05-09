import { test } from '../spec/index.ts';

import { nTimes } from './nTimes.ts';

export const spec = test(`nTimes`, $ => {
	$.assert(x => x(nTimes(2, `foo`).join(` `)) === `foo foo`);
	$.assert(x => x(nTimes(3, (nil, index) => index).join(` `)) === `0 1 2`);
	$.assert(x => x(nTimes(3).join(` `)) === `0 1 2`);
});
