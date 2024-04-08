import { FPSLoop } from './fpsLoop.ts';

export function transition(
	options: {
		duration: number;
		loopsPerSecond?: number;
		valueEnd?: number;
		valueStart?: number;
	},
	doWhat: (value: number) => void,
): FPSLoop {
	const valueStart = options.valueStart ?? 0;
	const valueEnd = options.valueEnd ?? 1;
	const difference = valueStart - valueEnd;

	let value = valueStart;

	const loop = new FPSLoop(
		() => {
			const remainingTime = loop.duration - loop.timeElapsed;
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
