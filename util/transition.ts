import { FPSLoop } from './fpsLoop.ts';

export function transition(
	doWhat: (value: number) => void,
	options: {
		duration: number;
		loopsPerSecond?: number;
		valueEnd?: number;
		valueStart?: number;
	}
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
				doWhat(valueEnd);
				loop.end();
				return;
			}

			doWhat(value);
		},
		options,
	);

	return loop;
}
