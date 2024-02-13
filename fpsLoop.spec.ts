import { suite, test } from './spec/index.ts';
import { mean } from 'math/average.ts';
import { roundTo } from 'roundTo.ts';
import { sleep } from 'sleep.ts';

import { FPSLoop } from './fpsLoop.ts';

const framesPerSecond = 20;
const milliseconds = 1000;
const maxLoops = framesPerSecond / 2;
const msPerLoopMin = milliseconds / framesPerSecond;
const msPerLoopMax = msPerLoopMin + 1;
const duration = (msPerLoopMin * maxLoops) + 100; // Adding some buffer

export const spec = suite(`FPSLoop`,
	{
		args: () => {
			let lastTime = undefined as number | undefined;
			const times = [] as Array<number>;
			const loop = new FPSLoop(
				() => {
					const time = performance.now();
					if (lastTime !== undefined) {
						const timeSinceLast = roundTo(time - lastTime, 3);
						times.push(timeSinceLast);
					}
					lastTime = time;
					if (times.length >= maxLoops) {
						loop.resolve();
					}
				},
				{ framesPerSecond }
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
		$.assert(x => x(msPerLoopMin) <= x(average) && x(average) <= x(msPerLoopMax));
	}),

	test(`sleep`, async $ => {
		const { loop, times } = $.args;
		void loop.begin();
		$.assert(x => x(loop.state) === `running`);
		await sleep(duration + (msPerLoopMin * 1));
		$.assert(x => x(loop.state) === `ended`);
		$.assert(x => x(times.length) === x(maxLoops));
		const average = Math.round(mean(...times));
		$.assert(x => x(msPerLoopMin) <= x(average) && x(average) <= x(msPerLoopMax));
		await loop.currentLoop;
	}),

	test(`pause`, async $ => {
		const { loop, times } = $.args;
		void loop.begin();
		$.assert(x => x(loop.state) === `running`);
		await sleep(duration / 2);
		$.log(() => loop.pause());
		$.assert(x => x(loop.state) === `paused`);
		$.assert(x => x(times.length) === x(maxLoops / 2));
		$.log(() => loop.unpause());
		await sleep(duration / 2);
		$.assert(x => x(loop.state) === `ended`);
		$.assert(x => x(times.length) === x(maxLoops));
	}),
);
