import { test } from '../spec/index.js';

import { isBetween } from '../math/isBetween.js';
import { Timer } from './timer.js';

import { delay } from './delay.js';

export const spec = test(import.meta.url, async $ => {
	const timer = new Timer();
	let count = 0;

	let delayed = delay(() => count += 10, 20);

	$.assert(x => x(count) === 0);
	$.assert(x => x(timer.check()) < 20);

	await delayed;

	$.assert(x => x(count) === 10);
	$.assert(x => x(timer.check()) > 20);

	delayed = delay(() => count += 7, 43);

	$.assert(x => x(count) === 10);
	$.assert(x => isBetween(20, x(timer.check()), 20 + 43));

	await delayed;

	$.assert(x => x(count) === 17);
	$.assert(x => x(timer.check()) > 20 + 43);
});
