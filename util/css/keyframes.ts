import { roundTo } from '../math/roundTo.ts';

/**
 * Returns the contents of a CSS `@keyframes` at-rule, calculating the duration % for each step. For each arg, if it's a number it increases the duration. If it's a string it outputs another step at the duration % so far.
 */
export function keyframes(
	initialState: string,
	...states: Array<number | string>
) {
	const formatted = states.map(arg => {
		if (typeof arg === `number`) {
			return arg;
		}

		return { animation: arg };
	});

	const result = keyframesMulti(
		{ animation: initialState },
		...formatted,
	);

	return result.animation.keyframes;
}

/**
 * Returns the keyframes and timing information for multiple CSS animations.
 * @see {@link keyframes}.
 */
export function keyframesMulti<
	AnimationName extends string,
	AnimationState extends Record<AnimationName, string>,
>(
	...args: [
		Record<AnimationName, string | undefined>,
		...Array<Partial<Record<AnimationName, string>> | number>,
	]
) {
	const animationsByName = {} as Record<keyof AnimationState, {
		keyframes: ``;
		name: AnimationName;
		timeDuration: number;
		timeEnd: number;
		timeStart: number;
	}>;

	let timeTotal = 0;
	for (const arg of args) {
		if (typeof arg === `number`) {
			timeTotal += arg;
			continue;
		}

		for (const key in arg) {
			const animationName = key as AnimationName;
			const animation = animationsByName[animationName] ??= {
				keyframes: ``,
				name: animationName,
				timeDuration: -1,
				timeEnd: -1,
				timeStart: -1,
			};

			if (arg[animationName] === undefined) {
				continue;
			}

			if (animation.timeStart < 0) {
				animation.timeStart = timeTotal;
			}

			animation.timeEnd = timeTotal;
		}
	}

	for (const animationName in animationsByName) {
		const animation = animationsByName[animationName];
		if (animation.timeEnd < 0) {
			animation.timeEnd = timeTotal;
		}

		animation.timeDuration = (animation.timeEnd - animation.timeStart);
	}

	let timeSoFar = 0;
	for (let index = 0, length = args.length; index < length; index += 1) {
		const arg = args[index];

		if (typeof arg === `number`) {
			timeSoFar += arg;
			continue;
		}

		for (const animationName in arg) {
			const keyframe = arg[animationName];
			if (keyframe === undefined) {
				continue;
			}

			const animation = animationsByName[animationName];
			const percentComplete = (timeSoFar - animation.timeStart) / animation.timeDuration;
			const percentString = roundTo(100 * percentComplete, 2);

			animation.keyframes += `${percentString}% {${keyframe}}\n`;
		}
	}

	let compiled = ``;
	for (const animationName in animationsByName) {
		const animation = animationsByName[animationName];
		compiled += `@keyframes ${animationName} {\n${animation.keyframes}}\n`;
	}
	Object.defineProperty(animationsByName, `toString`, {
		enumerable: false,
		value: () => compiled,
	});

	return animationsByName;
}
