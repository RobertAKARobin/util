import { suite, test } from '../spec/index.js';

import { isBetween } from '../math/isBetween.js';
import { nTimes } from '../group/nTimes.js';
import { preciseTo } from '../math/preciseTo.js';

import { Timer } from './timer.js';

export const spec = suite(import.meta.url, {},
	test(`.time increments and .restart brings back to 0`, $ => {
		const timer = new Timer();

		$.assert(x => x(timer.elapsed) > 0);

		let last = timer.elapsed;

		nTimes(10, () => {
			const now = timer.elapsed;
			$.assert(x => x(now) > x(last));
			last = now;
		});

		timer.restart();

		const now = timer.elapsed;
		$.assert(x => x(now) < x(last));
	}),

	suite(`.pause`, {},
		test(`causes time to stay unchanged until unpaused`, $ => {
			const timer = new Timer();
			let lastStart = timer.start;

			$.assert(x => x(timer.paused) === false);
			$.assert(x => isNaN(x(timer.pauseStart)));
			$.assert(x => x(timer.pauseDuration) === 0);
			$.assert(x => x(timer.pauseDurationCumulative) === 0);

			timer.pause();

			let lastCheck = timer.elapsed;

			$.assert(x => x(timer.paused) === true);
			$.assert(x => x(timer.start) === x(lastStart));
			$.assert(x => x(timer.elapsed) === x(lastCheck));

			$.assert(x => isBetween(timer.start, x(timer.pauseStart), performance.now()));
			$.assert(x => x(lastCheck) === x(preciseTo(timer.pauseStart - lastStart)));
			$.assert(x => x(timer.pauseDurationCumulative) === 0);

			timer.pause(false);

			$.assert(x => x(timer.paused) === false);
			$.assert(x => x(timer.start) === x(lastStart));
			$.assert(x => x(timer.elapsed) > x(lastCheck));
			$.assert(x => x(timer.pauseDurationCumulative) > 0);
		}),

		test(`if doesn't change state, then doesn't do anything`, $ => {
			const timer = new Timer();

			timer.pause();

			const lastPauseStart = timer.pauseStart;

			timer.pause();
			timer.pause();

			$.assert(x => x(timer.pauseStart) === x(lastPauseStart));

			timer.pause(false);

			const lastPauseDuration = timer.pauseDurationCumulative;

			timer.pause(false);

			$.assert(x => x(timer.pauseDurationCumulative) === lastPauseDuration);
		}),

		test(`repausing and restarting`, $ => {
			const timer = new Timer();

			timer.pause();
			timer.pause(false);

			const lastPauseDuration = timer.pauseDurationCumulative;

			timer.pause();
			timer.pause(false);

			$.assert(x => x(timer.pauseDurationCumulative) > lastPauseDuration);

			timer.pause();
			timer.restart();

			$.assert(x => isNaN(x(timer.pauseStart)));
			$.assert(x => x(timer.pauseDurationCumulative) === 0);
		}),
	),
);
