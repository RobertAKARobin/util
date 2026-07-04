import { test } from '../spec/index.js';

import { getSum } from '../math/sum.js';
import { nTimes } from '../group/nTimes.js';
import { sleep } from './sleep.js';
import { Timer } from './timer.js';

import { promiseConsecutive } from './promiseConsecutive.js';

export const spec = test(import.meta.url, async $ => {
	const times = nTimes(10).map(number => number * 10).reverse();
	const timer = new Timer();
	const elapsedMin = getSum(...times);

	let timesSoFar = /** @type {Array<number>} */([]);
	const outputs = await promiseConsecutive(
		times.map(
			(time, indexInInput) =>
				async(indexInOutput, /** @type {Array<number>} */outputsSoFar) => {
					await sleep(time);
					$.assert(x => x(indexInInput) === x(indexInOutput));
					$.assert(x => x(outputsSoFar.length) === x(indexInInput));

					if (indexInInput > 0) {
						$.assert(x => outputsSoFar.includes(x(times[indexInInput - 1])));
					}
					$.assert(x => outputsSoFar.includes(x(times[indexInInput + 1])) === false);

					$.assert(x => x(outputsSoFar.join(` `)) === x(timesSoFar.join(` `)));

					timesSoFar.push(time);
					return time;
				},
		),
	);

	$.assert(x => x(timer.elapsed) >= x(elapsedMin));
	$.assert(x => x(times.join(` `)) === x(outputs.join(` `)));
});
