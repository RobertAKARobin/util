import { test } from '../spec/index';

import { preciseTo } from './preciseTo';

import { polygonRadius as polygonRadius_ } from './polygonRadius';

function polygonRadius(...args: Parameters<typeof polygonRadius_>) {
	return preciseTo(polygonRadius_(...args));
}

function hypotenuseFromSide(sideLength: number) {
	return preciseTo(Math.sqrt(2 * Math.pow(sideLength, 2)));
}

function sideFromHypotenuse(hypotenuseLength: number) {
	return preciseTo(
		Math.sqrt(
			Math.pow(hypotenuseLength, 2) / 2,
		),
	);
}

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(polygonRadius(3, 3, `inner`)) === 1.5);
	$.assert(x => x(polygonRadius(3, 3, `outer`)) === 6);

	$.assert(x => x(polygonRadius(8, 3, `inner`)) === 4);
	$.assert(x => x(polygonRadius(8, 3, `outer`)) === 16);

	$.assert(x => x(polygonRadius(4, 4, `inner`)) === x(sideFromHypotenuse(4)));
	$.assert(x => x(polygonRadius(4, 4, `outer`)) === x(hypotenuseFromSide(4)));
});
