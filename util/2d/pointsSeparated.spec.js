import { test } from '../spec/index.js';

import { pointsAreDifferent } from './pointsAreDifferent.js';
import { pointsSeparated } from './pointsSeparated.js';
import { toCoordinate } from './toCoordinate.js';

export const spec = test(import.meta.url, $ => {
	const points = [[2, 0], [1, 0], [0, 0], [1, 0], [1, 0], [0, 1], [0, 2]].map(toCoordinate);
	$.assert(x => x(points.length) === 7);
	$.assert(x => x(pointsAreDifferent(points[3], points[4])) === false);

	const subject = pointsSeparated(...points);
	$.assert(x => x(subject.length) === 6);
	$.assert(x => x(pointsAreDifferent(subject[3], subject[4])));
});
