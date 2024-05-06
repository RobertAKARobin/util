import { test } from '../spec/index.ts';

import { anglesFromPoints } from './anglesFromPoints.ts';
import { radiansTo } from './radians.ts';
import { roundTo } from './roundTo.ts';
import { sum } from './sum.ts';

export const spec = test(`anglesFromPoints`, $ => {
	const precision = 2;
	const pi = (multiplier: number) => roundTo(Math.PI * multiplier, precision);
	const angles = (...points: Parameters<typeof anglesFromPoints>) =>
		anglesFromPoints(...points).map(angle => roundTo(angle, precision));

	let subject = anglesFromPoints([0, 0], [3, 0], [3, 3]);
	$.assert(x => x(roundTo(subject[0], 2)) === pi(1 / 2));
	$.assert(x => x(roundTo(subject[1], 2)) === pi(1 / 4));
	$.assert(x => x(roundTo(subject[2], 2)) === pi(1 / 4));
	$.assert(x => x(radiansTo(sum(...subject))) === 180);

	subject = angles([0, 0], [3, 0], [3, 4]);
	$.assert(x => x(roundTo(subject[0], 2)) === 1.57);
	$.assert(x => x(roundTo(subject[1], 2)) === .64);
	$.assert(x => x(roundTo(subject[2], 2)) === .93);
	$.assert(x => x(radiansTo(sum(...subject))) === 180);
});
