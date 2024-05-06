import { test } from '../spec/index.ts';

import { pointsSeparated } from './pointsSeparated.ts';
import { pointsToLines } from './pointsToLines.ts';
import { pointToString } from './pointToString.ts';
import segments from '../mock/segments.json';

export const spec = test(`pointsToLines`, $ => {
	const points = pointsSeparated(...segments.flat());
	const lines = pointsToLines(points)
		.map(({ begin, end }) => `${pointToString(begin)}-${pointToString(end)}`)
		.join(` `);

	$.assert(x => x(lines) === x(`5,5-50,5 50,5-30,30 30,30-50,50 50,50-70,70 70,70-95,50 95,50-95,70 95,70-50,115 50,115-5,80 5,80-5,5`));
});
