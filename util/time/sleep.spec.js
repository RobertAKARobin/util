import { test } from '../spec/index.js';

import { isBetween } from '../math/isBetween.js';
import { Timer } from './timer.js';

import { sleep } from './sleep.js';

export const spec = test(import.meta.url, async $ => {
	const timer = new Timer();

	let sleeper = sleep(20);

	$.assert(x => x(timer.elapsed) < 20);

	await sleeper;

	$.assert(x => x(timer.elapsed) > 20);

	sleeper = sleep(33);

	$.assert(x => isBetween(20, x(timer.elapsed), 20 + 33));

	await sleeper;

	$.assert(x => x(timer.elapsed) > 20 + 33);
});
