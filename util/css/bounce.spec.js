import { test } from '../spec/index.js';

import { roundTo } from '../math/roundTo.js';
import { tryCatch } from '../tryCatch.js';

import { bounceKeyframes } from './bounce.js';

export const spec = test(import.meta.url, $ => {
	const options = {
		bounciness: .5,
		distance: 333,
		distanceMin: 1,
		duration: 1000,
		durationMin: .01,
		precision: .01,
	};

	$.assert(() => tryCatch(() => bounceKeyframes({ ...options, bounciness: 0 })) instanceof Error);
	$.assert(() => tryCatch(() => bounceKeyframes({ ...options, bounciness: 1 })) instanceof Error);

	const keyframes = bounceKeyframes(options);

	function bounceAt(/** @type {number} */ input, /** @type {number} */exponent) {
		return roundTo(input * Math.pow(options.bounciness, exponent), options.precision);
	}

	$.assert(x => x(keyframes[0].duration) === 1000);
	$.assert(x => x(keyframes[0].distance) === 333);
	$.assert(x => x(keyframes[0].easing).endsWith(`ease-out`));

	$.assert(x => x(keyframes[1].duration) === x(keyframes[0].duration));
	$.assert(x => x(keyframes[1].distance) === 0);
	$.assert(x => x(keyframes[1].easing).endsWith(`ease-in`));

	$.assert(x => x(keyframes[2].duration) === x(bounceAt(1000, 1)));
	$.assert(x => x(keyframes[2].distance) === x(bounceAt(333, 1)));
	$.assert(x => x(keyframes[2].easing).endsWith(`ease-out`));

	$.assert(x => x(keyframes[3].duration) === x(keyframes[2].duration));
	$.assert(x => x(keyframes[3].distance) === 0);
	$.assert(x => x(keyframes[3].easing).endsWith(`ease-in`));

	$.assert(x => x(keyframes[4].duration) === x(bounceAt(1000, 2)));
	$.assert(x => x(keyframes[4].distance) === x(bounceAt(333, 2)));
	$.assert(x => x(keyframes[4].easing).endsWith(`ease-out`));

	$.assert(x => x(keyframes[5].duration) === x(keyframes[4].duration));
	$.assert(x => x(keyframes[5].distance) === 0);
	$.assert(x => x(keyframes[5].easing).endsWith(`ease-in`));

	$.assert(x => x(keyframes.length) === 20);

	$.assert(x => x(keyframes[18].duration) === x(bounceAt(1000, 9)));
	$.assert(x => x(keyframes[18].distance) === x(bounceAt(333, 9)));
	$.assert(x => x(keyframes[18].distance) <= options.distanceMin);
	$.assert(x => x(keyframes[18].easing).endsWith(`ease-out`));

	$.assert(x => x(keyframes[19].duration) === x(keyframes[18].duration));
	$.assert(x => x(keyframes[19].distance) === 0);
	$.assert(x => x(keyframes[19].easing).endsWith(`ease-in`));
});

