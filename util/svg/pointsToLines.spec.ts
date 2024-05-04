import { test } from '../spec/index.ts';

import { PathNavigator } from './pathNavigator.ts';
import { pointsToLines } from './pointsToLines.ts';

export const spec = test(`pathToSegments`, $ => {
	const path = document.querySelector(`path`)!;
	const pathData = path.getAttribute(`d`)!;
	const points = PathNavigator.fromData(pathData).toPoints();
	const lines = pointsToLines(points)
		.map(({ begin, end }) => `${begin.x},${begin.y}-${end.x},${end.y}`)
		.join(` `);

	$.assert(x => x(lines) === x(`5,5-50,5 50,5-30,30 30,30-50,50 50,50-70,70 70,70-95,50 95,50-95,70 95,70-50,115 50,115-5,80 5,80-5,5`));
});
