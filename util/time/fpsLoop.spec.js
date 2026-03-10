import { suite, test } from '../spec/index.js';
import { getDifference } from '../math/difference.js';
import { mean } from '../math/average.js';
import { roundTo } from '../math/roundTo.js';
import { runContext } from '../web/context.js';
import { sleep } from './sleep.js';

import { FPSLoop } from './fpsLoop.js';

const msPerSecond = 1000;
const msPerTick = runContext === `browser` ? 15 : 1;

export const spec = suite(`FPSLoop`,
	{
		args: () => {
			/** @type {number | undefined} */
			let lastTime;
			/** @type {Array<number>} */
			const loopTimes = [];
			const loopsPerSecond = roundTo((Math.random() * 59) + 1, 1);
			const msPerLoop = msPerSecond / loopsPerSecond;
			const maxLoops = roundTo(loopsPerSecond / 1, 1);
			const expectedDuration = msPerLoop * maxLoops;
			const loop = new FPSLoop(
				() => {
					const now = loop.check();
					if (lastTime !== undefined) {
						const timeSinceLast = now - lastTime;
						loopTimes.push(timeSinceLast);
					}
					lastTime = now;
					if (loopTimes.length >= maxLoops) {
						loop.end();
					}
				},
				{ loopsPerSecond },
			);
			const args = {
				expectedDuration,
				loop,
				loopTimes,
				loopsPerSecond,
				maxLoops,
				msPerLoop,
			};
			return args;
		},
		iterations: 10,
		timing: `concurrent`,
	},

	test(`await`, async $ => {
		const { loop, loopTimes } = $.args;
		$.log(`${$.args.loopsPerSecond} loops per second`);
		$.assert(x => x(loop.status) === `unstarted`);
		loop.restart();
		await loop.currentLoop;
		$.assert(x => x(loop.status) === `ended`);
		$.assert(x => x(loopTimes.length) === x($.args.maxLoops));
		const average = mean(...loopTimes);
		$.assert(x => getDifference(x(average), x($.args.msPerLoop)) <= msPerTick);
		$.assert(x => getDifference(x(loop.check()), x($.args.expectedDuration)) <= msPerTick);
	}),

	test(`sleep`, async $ => {
		const { loop, loopTimes } = $.args;
		$.log(`${$.args.loopsPerSecond} loops per second`);
		loop.restart();
		$.assert(x => x(loop.status) === `started`);
		await sleep($.args.expectedDuration + ($.args.msPerLoop * 1));
		$.assert(x => x(loop.status) === `ended`);
		$.assert(x => x(loopTimes.length) === x($.args.maxLoops));
		const average = mean(...loopTimes);
		$.assert(x => getDifference(x(average), x($.args.msPerLoop)) <= msPerTick);
		// await loop.currentLoop;
		// $.assert(x => getDifference(x(loop.check()), x($.args.expectedDuration)) <= msPerTick);
	}),

	test(`pause`, async $ => {
		const { loop, loopTimes } = $.args;
		$.log(`${$.args.loopsPerSecond} loops per second`);
		void loop.restart();
		$.assert(x => x(loop.status) === `started`);
		await sleep(($.args.expectedDuration / 2) + msPerTick);
		$.log(() => loop.pause());
		$.assert(x => x(loop.paused));
		$.assert(x => getDifference(x(loopTimes.length), x($.args.maxLoops / 2)) <= 1);
		$.log(() => loop.pause(false));
		await sleep(($.args.expectedDuration / 2) + msPerTick);
		$.assert(x => x(loop.status) === `ended`);
		$.assert(x => x(loopTimes.length) === x($.args.maxLoops));
		// $.assert(x => getDifference(x(loop.timeElapsed), x($.args.expectedDuration)) <= msPerTick);
	}),
);
