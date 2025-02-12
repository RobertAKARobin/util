import { test } from '../spec/index.js';

import { mean } from './average.js';

export const spec = test(import.meta.url, $ => {
	const subject = `86753`.split(``).map(Number);
	$.assert(x => x(mean(...subject)) === 5.8);
	$.assert(() => Number.isNaN(mean()));
});
