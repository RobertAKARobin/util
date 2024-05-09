import { test } from '../spec/index.ts';

import { pointsToMidpoints } from './pointsToMidpoints.ts';
import segments from '../mock/segments.json';

export const spec = test(import.meta.url, $ => {
	const points = segments[1];

	$.assert(x => x(points.length) === 4);


	let midpoints = pointsToMidpoints(points, { percent: 0 });
	$.assert(x => x(midpoints.length) === 1);
	$.assert(x => x(midpoints[0].x) === points[0].x);
	$.assert(x => x(midpoints[0].y) === points[0].y);

	midpoints = pointsToMidpoints(points, { percent: 1 });
	$.assert(x => x(midpoints.length) === 1);
	$.assert(x => x(midpoints[0].x) === points[points.length - 1].x);
	$.assert(x => x(midpoints[0].y) === points[points.length - 1].y);

	midpoints = pointsToMidpoints(points, { percent: .5 });
	$.assert(x => x(midpoints.length) === 3);
	$.assert(x => x(midpoints[0].x) === 50);
	$.assert(x => x(midpoints[0].y) === 5);
	$.assert(x => x(midpoints[1].x) === 40);
	$.assert(x => x(midpoints[1].y) === 17.5);
	$.assert(x => x(midpoints[2].x) === 40);
	$.assert(x => x(midpoints[2].y) === 40);

	midpoints = pointsToMidpoints(points, { percent: .2 });
	$.assert(x => x(midpoints.length) === 3);
	$.assert(x => x(midpoints[0].x) === 50);
	$.assert(x => x(midpoints[0].y) === 5);
	$.assert(x => x(midpoints[1].x) === 46);
	$.assert(x => x(midpoints[1].y) === 10);
	$.assert(x => x(midpoints[2].x) === 34);
	$.assert(x => x(midpoints[2].y) === 34);

	midpoints = pointsToMidpoints(points, { includeGiven: true });
	$.assert(x => x(midpoints.length) === 7);
	$.assert(x => x(midpoints[0].x) === x(points[0].x));
	$.assert(x => x(midpoints[0].y) === x(points[0].y));
	$.assert(x => x(midpoints[midpoints.length - 1].x) === x(points[points.length - 1].x));
	$.assert(x => x(midpoints[midpoints.length - 1].y) === x(points[points.length - 1].y));
});
