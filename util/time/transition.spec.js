import { getDifference } from '../math/difference.js';
import { test } from '../spec/index.js';

import { transition } from './transition.js';

export const spec = test(import.meta.url, $ => {
	const loopsPerSecond = 60;
	const durationTarget = 1000;
	let subject = 0;
	const enter = transition({
		duration: durationTarget,
		loopsPerSecond,
		valueEnd: 1,
		valueStart: 0,
	}, value => subject = value);

	$.log(`enter`);
	$.assert(x => x(subject) === 0);
	// await enter.start();
	$.assert(x => getDifference(x(enter.elapsed), x(durationTarget)) <= 50);
	$.assert(x => x(subject) === 1);

	$.log(`exit`);
	const exit = transition({
		duration: durationTarget,
		loopsPerSecond,
		valueEnd: 0,
		valueStart: 1,
	}, value => subject = value);
	// await exit.start();
	$.assert(x => getDifference(x(exit.elapsed), x(durationTarget)) <= 50);
	$.assert(x => x(subject) === 0);
});
