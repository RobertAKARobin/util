import { FPSLoop } from './fpsLoop.js';

/**
 * Execute the given function over the given interval while on each execution incrementing `valueStart` toward `valueEnd`
 * @param {object} options
 * @param {number} options.duration
 * @param {number} [options.loopsPerSecond]
 * @param {number} [options.valueEnd]
 * @param {number} [options.valueStart]
 * @param {(value: number) => void} doWhat
 * @returns {FPSLoop}
 */
export function transition(options, doWhat) {
	const valueStart = options.valueStart ?? 0;
	const valueEnd = options.valueEnd ?? 1;
	const difference = valueStart - valueEnd;

	let value = valueStart;

	const loop = new FPSLoop(
		() => {
			const remainingTime = loop.duration - loop.elapsed;
			const remainingTimeAsPercent = (remainingTime / loop.duration);
			value = valueEnd + (remainingTimeAsPercent * difference);

			if (
				(valueStart === valueEnd)
				|| (valueStart < valueEnd && value >= valueEnd)
				|| (valueStart > valueEnd && value <= valueEnd)
			) {
				if (typeof doWhat !== `undefined`) {
					doWhat(valueEnd);
				}
				loop.end();
				return;
			}

			if (typeof doWhat !== `undefined`) {
				doWhat(value);
			}
		},
		options,
	);

	return loop;
}
