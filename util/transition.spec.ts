import { roundTo } from './roundTo.ts';
import { test } from './spec/index.ts';

import { transition } from './transition.ts';

export const spec = test(`transition`, async $ => {
	const framesPerSecond = 60;
	const durationTarget = 200;
	let durationActual = performance.now();
	let subject = 0;
	const enter = transition(
		value => subject = value,
		{
			duration: durationTarget,
			framesPerSecond,
			valueEnd: 1,
			valueStart: 0,
		}
	);

	$.assert(x => x(subject) === 0);
	await enter.begin();
	durationActual = performance.now() - durationActual;
	$.assert(x => x(roundTo(durationActual, -2)) === x(durationTarget));
	$.assert(x => x(subject) === 1);

	const exit = transition(
		value => subject = value,
		{
			valueEnd: 0,
			valueStart: 1,
		}
	);
	await exit.begin();
	$.assert(x => x(subject) === 0);
});
