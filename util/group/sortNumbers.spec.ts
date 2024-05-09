import { test } from '../spec/index.ts';

import { sortNumbers } from './sortNumbers.ts';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(sortNumbers(3, 20, 100).join(` `)) === `3 20 100`);
	$.assert(x => x(sortNumbers(100, 20, 3).join(` `)) === `3 20 100`);
	$.assert(x => x(sortNumbers(111, 1, 11).join(` `)) === `1 11 111`);
	$.assert(x => x(sortNumbers(0, 0, 0).join(` `)) === `0 0 0`);
	$.assert(x => x(sortNumbers(9, 9, 9.8, 9.9).join(` `)) === `9 9 9.8 9.9`);
});
