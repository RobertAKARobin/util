/**
 * @import { keyframesMulti } from './keyframes';
 */

// TODO1: Spec

import { roundTo } from '../math/roundTo';

/**
 * Returns a series of keyframes that make an object appear to bounce
 * @param {object} [options]
 * @param {number} [options.bounciness=.5]
 * @param {number} [options.distance=100]
 * @param {number} [options.distanceMin=1]
 * @param {number} [options.duration=.5]
 * @param {number} [options.durationMin=.01]
 * @param {(distance: number) => string} [options.setter]
 * @returns {Parameters<typeof keyframesMulti<'bounce'>>}
 * @see {@link keyframesMulti}
 */
export function bounce(options = {}) {
	const bounciness = options.bounciness ?? .5;
	const distanceMax = options.distance ?? 100;
	const distanceMin = options.distanceMin ?? 1;
	const durationMax = options.duration ?? .5;
	const durationMin = options.durationMin ?? .01;
	const setter = options.setter ?? (distance => `bottom: ${distance}px`);

	if (bounciness >= 1 || bounciness <= 0) {
		throw new Error(`Infinite loop in bounce`);
	}

	const states = /** @type {Parameters<typeof keyframesMulti<'bounce'>>} */([
		{ bounce: setter(0) },
	]);

	let distance = distanceMax;
	let duration = durationMax;
	while (duration >= durationMin && distance >= distanceMin) {
		states.push(duration, { bounce: `${setter(distance)};animation-timing-function:ease-in` });

		duration = roundTo(duration * bounciness, .01);
		distance = roundTo(distance * bounciness, .01);

		states.push(duration, { bounce: `${setter(0)};animation-timing-function:ease-out` });
	}

	return states;
}
