import { suite, test } from '../spec/index.ts';
import { appContext } from '../web/context.ts';
import { getDifference } from '../math/difference.ts';
import { mean } from '../math/average.ts';
import { roundTo } from '../math/roundTo.ts';
import { sleep } from './sleep.ts';

import { FPSLoop } from './fpsLoop.ts';

const msPerSecond = 1000;
const msPerTick = appContext === `browser` ? 15 : 1; // FPSLoop uses `setImmediate` in Node which has a tick of ~1ms, and `requestAnimationFrame` in browser which has a tick of ~15ms (usually ~10ms, but sometimes a bit more, not sure why)

export const spec = suite(`FPSLoop`,
	{
		args: () => {
			let lastTime = undefined as number | undefined;
			const times = [] as Array<number>;
			const loopsPerSecond = roundTo((Math.random() * 59) + 1, 1);
			const msPerLoop = msPerSecond / loopsPerSecond;
			const maxLoops = roundTo(loopsPerSecond / 1, 1);
			const expectedDuration = msPerLoop * maxLoops;
			const loop = new FPSLoop(
				() => {
					const time = performance.now();
					if (lastTime !== undefined) {
						const timeSinceLast = time - lastTime;
						times.push(timeSinceLast);
					}
					lastTime = time;
					if (times.length >= maxLoops) {
						loop.end();
					}
				},
				{ loopsPerSecond },
			);
			const args = {
				expectedDuration,
				loop,
				loopsPerSecond,
				maxLoops,
				msPerLoop,
				times,
			};
			return args;
		},
		iterations: 10,
	},

	test(`await`, async $ => {
		const { loop, times } = $.args;
		$.log(`${$.args.loopsPerSecond} loops per second`);
		$.assert(x => x(loop.status) === `unstarted`);
		await loop.start();
		$.assert(x => x(loop.status) === `ended`);
		$.assert(x => getDifference(x(times.length), x($.args.maxLoops)) === 0);
		const average = mean(...times);
		$.assert(x => getDifference(x(average), x($.args.msPerLoop)) <= msPerTick);
		$.assert(x => getDifference(x(loop.timeElapsed), x($.args.expectedDuration)) <= msPerTick);
	}),

	test(`sleep`, async $ => {
		const { loop, times } = $.args;
		$.log(`${$.args.loopsPerSecond} loops per second`);
		void loop.start();
		$.assert(x => x(loop.status) === `started`);
		await sleep($.args.expectedDuration + ($.args.msPerLoop * 1));
		$.assert(x => x(loop.status) === `ended`);
		$.assert(x => getDifference(x(times.length), x($.args.maxLoops)) === 0);
		const average = mean(...times);
		$.assert(x => getDifference(x(average), x($.args.msPerLoop)) <= msPerTick);
		await loop.currentLoop;
		$.assert(x => getDifference(x(loop.timeElapsed), x($.args.expectedDuration)) <= msPerTick);
	}),

	test(`pause`, async $ => {
		const { loop, times } = $.args;
		$.log(`${$.args.loopsPerSecond} loops per second`);
		void loop.start();
		$.assert(x => x(loop.status) === `started`);
		await sleep(($.args.expectedDuration / 2) + msPerTick);
		$.log(() => loop.pause());
		$.assert(x => x(loop.isPaused));
		$.assert(x => getDifference(x(times.length), x($.args.maxLoops / 2)) <= 1);
		$.log(() => loop.unpause());
		await sleep(($.args.expectedDuration / 2) + msPerTick);
		$.assert(x => x(loop.status) === `ended`);
		$.assert(x => getDifference(x(times.length), x($.args.maxLoops)) < 1);
		$.assert(x => getDifference(x(loop.timeElapsed), x($.args.expectedDuration)) <= msPerTick);
	}),
);
