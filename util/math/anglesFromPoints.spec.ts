import { test } from '../spec/index.ts';

import { anglesFromPoints } from './anglesFromPoints.ts';
import { roundTo } from './roundTo.ts';

export const spec = test(`anglesFromPoints`, $ => {
	const precision = 2;
	const pi = (multiplier: number) => roundTo(Math.PI * multiplier, precision);
	const angles = (...points: Parameters<typeof anglesFromPoints>) =>
		anglesFromPoints(...points).map(angle => roundTo(angle, precision));

	let subject = angles([0, 0], [3, 0], [3, 3]);
	$.assert(x => x(subject[0]) === pi(1 / 2));
	$.assert(x => x(subject[1]) === pi(1 / 4));
	$.assert(x => x(subject[2]) === pi(1 / 4));

	subject = angles([0, 0], [3, 0], [3, 4]);
	$.assert(x => x(subject[0]) === 1.57);
	$.assert(x => x(subject[1]) === .64);
	$.assert(x => x(subject[2]) === .93);
});
