import { roundTo } from '../math/roundTo.js';

/**
 * @typedef {Array<{
 * distance: number;
 * duration: number;
 * easing: string;
 * }>} BounceKeyframes
 */

/**
 * Returns a series of keyframes that make an object appear to bounce
 * @param {object} options
 * @param {number} [options.bounciness]
 * @param {number} [options.distance]
 * @param {number} [options.distanceMin]
 * @param {number} [options.duration]
 * @param {number} [options.durationMin]
 * @param {number} [options.precision]
 * @returns {BounceKeyframes}
 */
export function bounceKeyframes(options = {}) {
	const bounciness = options.bounciness ?? .5;
	const distanceMax = options.distance ?? 100;
	const distanceMin = options.distanceMin ?? 1;
	const durationMax = options.duration ?? .5;
	const durationMin = options.durationMin ?? .01;
	const precision = options.precision ?? .01;

	if (bounciness >= 1 || bounciness <= 0) {
		throw new Error(`Bounciness must be between 0 and 1`);
	}

	/** @type {BounceKeyframes} */
	const distancesByDuration = [];

	let count = 0;
	while (true) {
		const bounceFactor = Math.pow(bounciness, count);
		const duration = roundTo(durationMax * bounceFactor, precision);
		const distance = roundTo(distanceMax * bounceFactor, precision);
		distancesByDuration.push(
			{
				distance,
				duration,
				easing: `animation-timing-function:ease-out`,
			},
			{
				distance: 0,
				duration,
				easing: `animation-timing-function:ease-in`,
			},
		);

		if (duration <= durationMin || distance <= distanceMin) {
			break;
		}

		count += 1;
	}

	return distancesByDuration;
}
