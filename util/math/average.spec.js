import { test } from '../spec/index';

import { mean } from './average';

export const spec = test(import.meta.url, $ => {
	const subject = `86753`.split(``).map(Number);
	$.assert(x => x(mean(...subject)) === 5.8);
	$.assert(() => Number.isNaN(mean()));
});
