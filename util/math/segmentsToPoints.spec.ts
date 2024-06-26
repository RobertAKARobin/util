import { test } from '../spec/index.ts';

import { pointToString } from './pointToString.ts';
import segments from '../mock/segments.json';
import { segmentsToPoints } from './segmentsToPoints.ts';

export const spec = test(import.meta.url, $ => {
	const points = segmentsToPoints(segments).map(pointToString).join(` `);
	$.assert(x => x(points) === x(`5,5 50,5 30,30 50,50 70,70 95,50 95,70 50,115 5,80 5,5`));
});
