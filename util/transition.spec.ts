import { difference } from './math/difference.ts';
import { test } from './spec/index.ts';

import { transition } from './transition.ts';

export const spec = test(`transition`, async $ => {
	const loopsPerSecond = 60;
	const durationTarget = 1000;
	let subject = 0;
	const enter = transition(
		value => subject = value,
		{
			duration: durationTarget,
			loopsPerSecond,
			valueEnd: 1,
			valueStart: 0,
		}
	);

	$.log(`enter`);
	$.assert(x => x(subject) === 0);
	await enter.start();
	$.assert(x => difference(x(enter.timeElapsed), x(durationTarget)) <= 50);
	$.assert(x => x(subject) === 1);

	$.log(`exit`);
	const exit = transition(
		value => subject = value,
		{
			duration: durationTarget,
			loopsPerSecond,
			valueEnd: 0,
			valueStart: 1,
		}
	);
	await exit.start();
	$.assert(x => difference(x(exit.timeElapsed), x(durationTarget)) <= 50);
	$.assert(x => x(subject) === 0);
});
