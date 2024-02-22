import { test } from '../spec/index.ts';

import { mean } from './average.ts';
import { sum } from './sum.ts';

export const spec = test(`Math`, $ => {
	const subject = [8, 6, 0, 5, 1, 6, 6, 2, 1, 9];
	$.log(subject.join(`,`));
	$.assert(x => x(sum(...subject)) === 44);
	$.assert(x => x(mean(...subject)) === 4.4);
	$.assert(x => x(sum()) === 0);
	$.assert(() => Number.isNaN(mean()));
});
