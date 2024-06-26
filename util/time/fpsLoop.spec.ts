import { suite, test } from '../spec/index.ts';
import { getDifference } from '../math/difference.ts';
import { mean } from '../math/average.ts';
import { roundTo } from '../math/roundTo.ts';
import { sleep } from './sleep.ts';

import { FPSLoop } from './fpsLoop.ts';

const msPerSecond = 1000;

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
						const timeSinceLast = roundTo(time - lastTime, .001);
						times.push(timeSinceLast);
					}
					lastTime = time;
					if (times.length >= maxLoops) {
						loop.end();
					}
				},
				{ loopsPerSecond },
			);
			return {
				expectedDuration,
				loop,
				loopsPerSecond,
				maxLoops,
				msPerLoop,
				times,
			};
		},
		iterations: 10,
	},

	test(`await`, async $ => {
		const { loop, times } = $.args;
		$.log(`${$.args.loopsPerSecond} loops per second`);
		$.assert(x => x(loop.status) === `unstarted`);
		await loop.start();
		$.assert(x => x(loop.status) === `ended`);
		$.assert(x => getDifference(x(times.length), x($.args.maxLoops)) <= 3);
		const average = mean(...times);
		$.assert(x => x($.args.msPerLoop) <= x(average));
		$.assert(x => x(average) <= x($.args.msPerLoop + 1));
		$.assert(x => getDifference(x(loop.timeElapsed), x($.args.expectedDuration)) <= 50);
	}),

	test(`sleep`, async $ => {
		const { loop, times } = $.args;
		$.log(`${$.args.loopsPerSecond} loops per second`);
		void loop.start();
		$.assert(x => x(loop.status) === `started`);
		await sleep($.args.expectedDuration + ($.args.msPerLoop * 1));
		$.assert(x => x(loop.status) === `ended`);
		$.assert(x => getDifference(x(times.length), x($.args.maxLoops)) <= 3);
		const average = mean(...times);
		$.assert(x => x($.args.msPerLoop) <= x(average));
		$.assert(x => x(average) <= x($.args.msPerLoop + 1));
		await loop.currentLoop;
		$.assert(x => getDifference(x(loop.timeElapsed), x($.args.expectedDuration)) <= 50);
	}),

	test(`pause`, async $ => {
		const { loop, times } = $.args;
		$.log(`${$.args.loopsPerSecond} loops per second`);
		void loop.start();
		$.assert(x => x(loop.status) === `started`);
		await sleep($.args.expectedDuration / 2);
		$.log(() => loop.pause());
		$.assert(x => x(loop.isPaused));
		$.assert(x => getDifference(x(times.length), x($.args.maxLoops / 2)) <= 3);
		$.log(() => loop.unpause());
		await sleep(($.args.expectedDuration / 2) + 50);
		$.assert(x => x(loop.status) === `ended`);
		$.assert(x => getDifference(x(times.length), x($.args.maxLoops)) <= 3);
		$.assert(x => getDifference(x(loop.timeElapsed), x($.args.expectedDuration)) <= 50);
	}),
);
