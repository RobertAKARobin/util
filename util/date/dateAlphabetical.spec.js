import { test } from '../spec/index';

import { dateAlphabetical } from './dateAlphabetical';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(dateAlphabetical(new Date(1989, 3, 1, 15, 4, 12)).join(`-`)) === `1989-04-01-15-04-12`);
});
