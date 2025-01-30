import { roundTo } from '../math/roundTo';

/**
 * @template {PropertyKey} AnimationName
 * @typedef {{
 * initialState: string;
 * keyframes: string;
 * name: AnimationName;
 * timeDuration: number;
 * timeEnd: number;
 * timeStart: number;
 * }} AnimationData
 */

/**
 * Returns the contents of a CSS `@keyframes` at-rule, calculating the duration % for each step. For each arg, if it's a number it increases the duration. If it's a string it outputs another step at the duration % so far.
 * @param {string} initialState
 * @param {Array<string | number>} states
 * @returns {string}
 */
export function keyframes(
	initialState,
	...states
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
 * @template {string} AnimationName
 * @param {[Record<AnimationName, string | undefined>, ...Array<Partial<Record<AnimationName, string>> | number>,]} args
 * @returns {Record<AnimationName, AnimationData<AnimationName>>}
 * @see {@link keyframes}
 */
export function keyframesMulti(...args) {
	const animationsByName = /** @type {Record<AnimationName, AnimationData<AnimationName>>} */({});

	let timeTotal = 0;
	for (const arg of args) {
		if (typeof arg === `number`) {
			timeTotal += arg;
			continue;
		}

		for (const key in arg) {
			const animationName = /** @type {AnimationName} */(key);
			const animation = animationsByName[animationName] ??= {
				initialState: ``,
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
			if (animation.keyframes === ``) {
				animation.initialState = keyframe;
			}

			const percentComplete = (timeSoFar - animation.timeStart) / animation.timeDuration;
			const percentString = roundTo(100 * percentComplete, .01);

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
