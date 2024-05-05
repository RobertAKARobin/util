import { test } from '../spec/index.ts';

import { pointsAreDifferent } from './pointsAreDifferent.ts';
import { pointsToLines } from './pointsToLines.ts';
import segments from '../mock/segments.json';

export const spec = test(`pointsToLines`, $ => {
	const poo = segments.flat();
	const points = poo.filter((point, index, points) => {
		const next = points[index + 1];
		return pointsAreDifferent(point, next);
	});
	const lines = pointsToLines(points)
		.map(({ begin, end }) => `${begin.x},${begin.y}-${end.x},${end.y}`)
		.join(` `);

	$.assert(x => x(lines) === x(`5,5-50,5 50,5-30,30 30,30-50,50 50,50-70,70 70,70-95,50 95,50-95,70 95,70-50,115 50,115-5,80 5,80-5,5`));
});
