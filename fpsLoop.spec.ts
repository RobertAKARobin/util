import { suite, test } from './spec/index.ts';
import { mean } from 'math/average.ts';
import { sleep } from 'sleep.ts';

import { FPSLoop } from './fpsLoop.ts';

const loopsPerSecond = 20;
const milliseconds = 1000;
const maxLoops = loopsPerSecond / 2;
const msPerLoop = milliseconds / loopsPerSecond;
const duration = (msPerLoop * maxLoops) + 100; // Adding some buffer

export const spec = suite(`FPSLoop`,
	{
		args: () => {
			let lastTime = undefined as number | undefined;
			const times = [] as Array<number>;
			const loop = new FPSLoop(
				loop => {
					const time = performance.now();
					if (lastTime !== undefined) {
						const timeSinceLast = time - lastTime;
						times.push(timeSinceLast);
					}
					lastTime = time;
					if (times.length >= maxLoops) {
						loop.resolve();
					}
				},
				{ loopsPerSecond }
			);
			return {
				loop,
				times,
			};
		},
	},

	test(`await`, async $ => {
		const { loop, times } = $.args;
		$.assert(x => x(loop.state) === `unstarted`);
		await loop.begin();
		$.assert(x => x(loop.state) === `ended`);
		$.assert(x => x(times.length) === maxLoops);
		const average = Math.round(mean(...times));
		$.assert(x => x(msPerLoop) <= x(average) && x(average) <= x(msPerLoop + 2));
	}),

	test(`sleep`, async $ => {
		const { loop, times } = $.args;
		void loop.begin();
		$.assert(x => x(loop.state) === `running`);
		await sleep(duration + (msPerLoop * 1));
		$.assert(x => x(loop.state) === `ended`);
		$.assert(x => x(times.length) === x(maxLoops));
		const average = Math.round(mean(...times));
		$.assert(x => x(msPerLoop) <= x(average) && x(average) <= x(msPerLoop + 1));
		await loop.currentLoop;
	}),

	test(`pause`, async $ => {
		const { loop, times } = $.args;
		void loop.begin();
		$.assert(x => x(loop.state) === `running`);
		await sleep((duration / 2) + (msPerLoop * 2));
		$.log(() => loop.pause());
		$.assert(x => x(loop.state) === `paused`);
		$.assert(x => x(times.length) === x((maxLoops / 2) + 1));
		$.log(() => loop.unpause());
		await sleep((duration / 2) + (msPerLoop * 2));
		$.assert(x => x(loop.state) === `ended`);
		$.assert(x => x(times.length) === x(maxLoops));
	}),
);
