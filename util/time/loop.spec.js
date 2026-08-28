import { suite, test } from '../spec/index.js';
import { isBetween } from '../math/isBetween.js';
import { roundTo } from '../math/roundTo.js';
import { runContext } from '../web/context.js';
import { sleep } from './sleep.js';

import { Loop } from './loop.js';

const msPerSecond = 1000;
const msPerTick = runContext === `browser` ? 15 : 1; // TODO3: Extract this to /const?

function loopArgs() {
	return {
		duration: 100 + roundTo(Math.random() * 400, 1),
		rate: roundTo((Math.random() * 59) + 1, 1),
	};
}

export const spec = suite(`Loop`, {},

	test(`with no duration or rate, no iterations and ends only on .end`, $ => {
		const loop = new Loop(() => {});
		$.assert(x => x(loop.status) === `unstarted`);
		$.assert(x => x(loop.iterationsSoFar) === 0);
		$.assert(x => x(loop.period) === Infinity);
		$.assert(x => x(loop.duration) === Infinity);
		$.assert(x => x(loop.elapsed) === 0);

		loop.restart();
		$.assert(x => x(loop.status) === `started`);
		$.assert(x => x(loop.iterationsSoFar) === 0);
		$.assert(x => x(loop.elapsed) > 0);

		loop.end();
		$.assert(x => x(loop.status) === `ended`);
		$.assert(x => x(loop.iterationsSoFar) === 0);
		$.assert(x => x(loop.elapsed) > 0);

		loop.restart();
		const restarted = loop;
		$.assert(x => x(restarted.status) === `started`);
		$.assert(x => x(restarted.iterationsSoFar) === 0);
		$.assert(x => x(restarted.elapsed) > 0);

		restarted.end();
		$.assert(x => x(restarted.status) === `ended`);
		$.assert(x => x(restarted.iterationsSoFar) === 0);
		$.assert(x => x(restarted.elapsed) > 0);
	}),

	test(`with no rate, no iterations and ends on .end or after duration`, async $ => {
		const duration = 10 * msPerTick;
		const loop = new Loop(() => {}, { duration });
		$.assert(x => x(loop.status) === `unstarted`);
		$.assert(x => x(loop.iterationsSoFar) === 0);
		$.assert(x => x(loop.period) === Infinity);
		$.assert(x => x(loop.duration) === x(duration));
		$.assert(x => x(loop.elapsed) === 0);

		loop.restart();
		$.assert(x => x(loop.status) === `started`);
		$.assert(x => x(loop.iterationsSoFar) === 0);
		$.assert(x => isBetween(0, x(loop.elapsed), x(duration)));

		await loop.ending;
		$.assert(x => x(loop.status) === `ended`);
		$.assert(x => x(loop.iterationsSoFar) === 0);
		$.assert(x => isBetween(x(duration), x(loop.elapsed), x(duration + msPerTick)));

		loop.restart();
		const restarted = loop;
		$.assert(x => x(restarted.status) === `started`);
		$.assert(x => x(restarted.iterationsSoFar) === 0);
		$.assert(x => isBetween(0, x(restarted.elapsed), x(duration)));

		await sleep(duration + msPerTick);
		$.assert(x => x(restarted.status) === `ended`);
		$.assert(x => x(restarted.iterationsSoFar) === 0);
		$.assert(x => isBetween(x(duration), x(loop.elapsed), x(duration + msPerTick)));

		restarted.restart();
		$.assert(x => x(restarted.status) === `started`);
		$.assert(x => isBetween(0, x(restarted.elapsed), x(duration)));

		restarted.end();
		$.assert(x => x(restarted.status) === `ended`);
		$.assert(x => isBetween(0, x(restarted.elapsed), x(duration)));
	}),

	test(`expected number of iterations`, async $ => {
		const times = /** @type {Array<number>} */([]);
		const { duration, rate } = loopArgs();
		const loop = new Loop(
			() => times.push(loop.elapsed),
			{ duration, rate },
		);

		$.assert(x => x(loop.status) === `unstarted`);
		$.assert(x => x(loop.iterationsSoFar) === 0);
		$.assert(x => x(loop.period) === (msPerSecond / x(rate)));
		$.assert(x => x(loop.duration) === x(duration));
		$.assert(x => x(loop.elapsed) === 0);

		loop.restart();
		$.assert(x => x(loop.status) === `started`);
		$.assert(x => x(loop.iterationsSoFar) === 1);

		await loop.ending;
		$.assert(x => x(loop.status) === `ended`);
		$.assert(x => x(loop.iterationsSoFar) === Math.ceil(x(duration) / msPerSecond * x(rate)));
		$.assert(x => isBetween(x(duration), x(loop.elapsed), x(duration + msPerTick)));

		let last = 0;
		for (const time of times) {
			$.assert(x => x(time) > x(last));
			last = time;
		}

		loop.restart();
		const restarted = loop;
		$.assert(x => x(restarted.status) === `started`);
		$.assert(x => x(loop.iterationsSoFar) === 1);
		$.assert(x => isBetween(0, x(restarted.elapsed), x(duration)));

		await restarted.ending;
		$.assert(x => x(restarted.status) === `ended`);
		$.assert(x =>
			x(restarted.iterationsSoFar) === Math.ceil(x(duration) / msPerSecond * x(rate)),
		);
		$.assert(x => isBetween(x(duration), x(restarted.elapsed), x(duration + msPerTick)));
	}),

	test(`.pause causes time and iterations to stop incrementing`, async $ => {
		const loop = new Loop(() => ({}), {
			rate: 10,
		});
		const sleepLength = loop.period * 2;

		loop.restart();

		let lastElapsed = loop.elapsed;
		let lastIterations = loop.iterationsSoFar;
		await sleep(sleepLength);

		loop.pause();
		$.assert(x => x(loop.paused));
		$.assert(x => x(loop.elapsed) > x(lastElapsed));
		$.assert(x => x(loop.iterationsSoFar) > x(lastIterations));

		lastElapsed = loop.elapsed;
		lastIterations = loop.iterationsSoFar;
		await sleep(sleepLength);

		$.assert(x => x(loop.paused));
		$.assert(x => x(loop.elapsed) === x(lastElapsed));
		$.assert(x => x(loop.iterationsSoFar) === x(lastIterations));

		lastElapsed = loop.elapsed;
		lastIterations = loop.iterationsSoFar;

		loop.pause(false);
		await sleep(sleepLength);
		$.assert(x => x(loop.paused) === false);
		$.assert(x => x(loop.elapsed) > x(lastElapsed));
		$.assert(x => x(loop.iterationsSoFar) > x(lastIterations));

		loop.pause();
		lastElapsed = loop.elapsed;
		lastIterations = loop.iterationsSoFar;
		await sleep(sleepLength);

		$.assert(x => x(loop.paused));
		$.assert(x => x(loop.elapsed) === x(lastElapsed));
		$.assert(x => x(loop.iterationsSoFar) === x(lastIterations));

		loop.pause(false);
		await sleep(sleepLength);

		$.assert(x => x(loop.paused) === false);
		$.assert(x => x(loop.elapsed) > x(lastElapsed));
		$.assert(x => x(loop.iterationsSoFar) > x(lastIterations));
	}),
);
