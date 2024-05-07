import { test } from '../spec/index.ts';

import { pointsToAngles } from './pointsToAngles.ts';
import { radiansTo } from './radians.ts';
import { roundTo } from './roundTo.ts';
import { sum } from './sum.ts';

export const spec = test(`pointsToAngles`, $ => {
	let subject: Array<number>;

	subject = pointsToAngles([0, 0], [3, 0], [3, 3]);
	$.assert(x => x(roundTo(subject[0])) === roundTo(Math.PI / 2)); // Dunno why this one needs rounding
	$.assert(x => x(subject[1]) === Math.PI / 4);
	$.assert(x => x(subject[2]) === Math.PI / 4);
	$.assert(x => x(radiansTo(sum(...subject))) === 180);

	subject = pointsToAngles([0, 0], [3, 0], [3, 4]);
	$.assert(x => x(roundTo(subject[0], .01)) === 1.57);
	$.assert(x => x(roundTo(subject[1], .01)) === .64);
	$.assert(x => x(roundTo(subject[2], .01)) === .93);
	$.assert(x => x(radiansTo(sum(...subject))) === 180);
});
