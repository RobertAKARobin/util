import { test } from '../spec/index.ts';

import { sum } from './sum.ts';

export const spec = test(`sum`, $ => {
	const subject = `8675309`.split(``).map(Number);
	$.assert(x => x(sum(...subject, 3.141)) === 41.141);
	$.assert(x => x(sum()) === 0);
});
