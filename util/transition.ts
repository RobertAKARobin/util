import { FPSLoop } from './fpsLoop.ts';
import { roundTo } from './math/roundTo.ts';

export function transition(
	doWhat: (value: number) => void,
	options: Partial<{
		duration: number;
		framesPerSecond: number;
		valueEnd: number;
		valueStart: number;
	}> = {},
): FPSLoop {
	const duration = options.duration ?? .2 * 1000;
	const framesPerSecond = options.framesPerSecond ?? 60;
	const loops = duration / (1000 / framesPerSecond);

	const valueStart = options.valueStart ?? 0;
	const valueEnd = options.valueEnd ?? 1;
	const difference = valueEnd - valueStart;
	const differencePerLoop = roundTo(difference / loops, 3);

	let value = valueStart;
	const loop = new FPSLoop(
		() => {
			if (
				(valueStart === valueEnd)
				|| (valueStart < valueEnd && value >= valueEnd)
				|| (valueStart > valueEnd && value <= valueEnd)
			) {
				doWhat(valueEnd);
				loop.resolve();
				return;
			}

			doWhat(value);
			value += differencePerLoop;
		},
		{ framesPerSecond }
	);
	return loop;
}
