import { type keyframesMulti } from './keyframes.ts';
import { roundTo } from '../math/roundTo.ts';

export function bounce(options: {
	bounciness?: number;
	distance?: number;
	distanceMin?: number;
	duration?: number;
	durationMin?: number;
	setter?: (distance: number) => string;
} = {}) {
	const bounciness = options.bounciness ?? .5;
	const distanceMax = options.distance ?? 100;
	const distanceMin = options.distanceMin ?? 1;
	const durationMax = options.duration ?? .5;
	const durationMin = options.durationMin ?? .01;
	const setter = options.setter ?? (distance => `bottom: ${distance}px`);

	if (bounciness >= 1 || bounciness <= 0) {
		throw new Error(`Infinite loop in bounce`);
	}

	const states = [
		{ bounce: setter(0) },
	] as unknown as Parameters<typeof keyframesMulti<`bounce`>>;

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
