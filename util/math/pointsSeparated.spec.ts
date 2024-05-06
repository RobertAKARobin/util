import { test } from '../spec/index.ts';

import { pointsAreDifferent } from './pointsAreDifferent.ts';
import { pointsSeparated } from './pointsSeparated.ts';
import { toCoordinate } from './toCoordinate.ts';

export const spec = test(`pointsSeparated`, $ => {
	const points = [[2, 0], [1, 0], [0, 0], [1, 0], [1, 0], [0, 1], [0, 2]].map(toCoordinate);
	$.assert(x => x(points.length) === 7);
	$.assert(x => x(pointsAreDifferent(points[3], points[4])) === false);

	const subject = pointsSeparated(...points);
	$.assert(x => x(subject.length) === 6);
	$.assert(x => x(pointsAreDifferent(subject[3], subject[4])));
});
