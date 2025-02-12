import { test } from '../spec/index.js';

import { getSum } from './sum.js';

export const spec = test(import.meta.url, $ => {
	const subject = `8675309`.split(``).map(Number);
	$.assert(x => x(getSum(...subject, 3.141)) === 41.141);
	$.assert(x => x(getSum()) === 0);
});
