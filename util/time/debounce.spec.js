import { test } from '../spec/index.js';

import { debounce } from './debounce.js';
import { sleep } from './sleep.js';
import { Timer } from './timer.js';

export const spec = test(import.meta.url, async $ => {
	let count = 0;

	/**
	 * @param {number} amount
	 */
	function increment(amount) {
		count += amount;
	}

	const timeLimit = 50;
	const next = debounce(increment, timeLimit);

	const timer = new Timer();

	$.assert(x => x(count) === 0);
	$.assert(x => x(timer.elapsed) < timeLimit);

	next(3);

	$.assert(x => x(count) === 3);
	$.assert(x => x(timer.elapsed) < timeLimit);

	next(4);
	next(5);
	next(6);

	$.assert(x => x(count) === 3);
	$.assert(x => x(timer.elapsed) < timeLimit);

	await sleep(timeLimit);

	next(4);

	$.assert(x => x(count) === 3 + 4);
	$.assert(x => x(timer.elapsed) > timeLimit);
});
