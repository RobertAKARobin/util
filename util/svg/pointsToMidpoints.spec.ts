import { test } from '../spec/index.ts';

import { PathNavigator } from './pathNavigator.ts';
import { pointsToMidpoints } from './pointsToMidpoints.ts';

export const spec = test(`pointsToMidpoints`, $ => {
	const path = document.querySelector(`path`)!;
	const pathData = path.getAttribute(`d`)!;
	const points = PathNavigator.fromData(pathData).segments[1];

	$.assert(x => x(points.length) === 4);


	let midpoints = pointsToMidpoints(0, ...points);
	$.assert(x => x(midpoints.length) === 1);
	$.assert(x => x(midpoints[0].x) === points[0].x);
	$.assert(x => x(midpoints[0].y) === points[0].y);

	midpoints = pointsToMidpoints(1, ...points);
	$.assert(x => x(midpoints.length) === 1);
	$.assert(x => x(midpoints[0].x) === points[points.length - 1].x);
	$.assert(x => x(midpoints[0].y) === points[points.length - 1].y);

	midpoints = pointsToMidpoints(.5, ...points);
	$.assert(x => x(midpoints.length) === 3);
	$.assert(x => x(midpoints[0].x) === 50);
	$.assert(x => x(midpoints[0].y) === 5);
	$.assert(x => x(midpoints[1].x) === 40);
	$.assert(x => x(midpoints[1].y) === 17.5);
	$.assert(x => x(midpoints[2].x) === 40);
	$.assert(x => x(midpoints[2].y) === 40);

	midpoints = pointsToMidpoints(.2, ...points);
	$.assert(x => x(midpoints.length) === 3);
	$.assert(x => x(midpoints[0].x) === 50);
	$.assert(x => x(midpoints[0].y) === 5);
	$.assert(x => x(midpoints[1].x) === 46);
	$.assert(x => x(midpoints[1].y) === 10);
	$.assert(x => x(midpoints[2].x) === 34);
	$.assert(x => x(midpoints[2].y) === 34);
});
