import { suite, test } from '../spec/index.js';

import { nTimes } from '../group/nTimes.js';

import { Timer } from './timer.js';

export const spec = suite(import.meta.url, {},
	test(`.check increments and .restart brings back to 0`, $ => {
		const timer = new Timer();

		$.assert(x => x(timer.check()) > 0);

		let last = timer.check();

		nTimes(10, () => {
			const now = timer.check();
			$.assert(x => x(now) > x(last));
			last = now;
		});

		timer.restart();

		const now = timer.check();
		$.assert(x => x(now) < x(last));
	}),

	test(`.pause`, $ => {
		const timer = new Timer();

		$.assert(x => x(timer.paused) === false);
	}),
);
