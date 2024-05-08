import type { Coordinate } from '../types.d.ts';
import segments from '../mock/segments.json';
import { test } from '../spec/index.ts';

import { pointsRotate } from './pointsRotate.ts';
import { pointToString } from './pointToString.ts';

export const spec = test(`pointRotate`, $ => {
	let subject: Array<Coordinate>;

	subject = pointsRotate([[0, 1], [1, 0]], [0, 0], 90);
	$.assert(x => x(pointToString(subject[0])) === `1,0`);
	$.assert(x => x(pointToString(subject[1])) === `0,-1`);

	subject = pointsRotate([[1, 0], [0, -1]], [0, 0], 90);
	$.assert(x => x(pointToString(subject[0])) === `0,-1`);
	$.assert(x => x(pointToString(subject[1])) === `-1,0`);

	subject = pointsRotate([[0, 1], [1, 0]], [0, 0], 180);
	$.assert(x => x(pointToString(subject[0])) === `0,-1`);
	$.assert(x => x(pointToString(subject[1])) === `-1,0`);

	subject = pointsRotate([[0, 1], [1, 0]], [1, 1], 45);
	$.assert(x => x(pointToString(subject[0])) === `0.3,1.7`);
	$.assert(x => x(pointToString(subject[1])) === `0.3,0.3`);

	subject = pointsRotate(segments[4], segments[4][0], -6.34);
	$.assert(x => x(pointToString(subject[0])) === `95,70`);
	$.assert(x => x(pointToString(subject[1])) === `45.3,109.8`);
});
