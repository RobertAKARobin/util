import { test } from '../spec/index';

import { pointsAreDifferent } from './pointsAreDifferent';
import { pointsSeparated } from './pointsSeparated';
import { toCoordinate } from './toCoordinate';

export const spec = test(import.meta.url, $ => {
	const points = [[2, 0], [1, 0], [0, 0], [1, 0], [1, 0], [0, 1], [0, 2]].map(toCoordinate);
	$.assert(x => x(points.length) === 7);
	$.assert(x => x(pointsAreDifferent(points[3], points[4])) === false);

	const subject = pointsSeparated(...points);
	$.assert(x => x(subject.length) === 6);
	$.assert(x => x(pointsAreDifferent(subject[3], subject[4])));
});
