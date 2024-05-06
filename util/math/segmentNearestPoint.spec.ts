import { test } from '../spec/index.ts';

import { segmentNearestPoint } from './segmentNearestPoint.ts';
import segments from '../mock/segments.json';

export const spec = test(`pointsToMidpoints`, $ => {
	$.assert(x => x(segmentNearestPoint([0, 0], ...segments)) === 0);
	$.assert(x => x(segmentNearestPoint([5, 5], ...segments)) === 0);
	$.assert(x => x(segmentNearestPoint([25, 0], ...segments)) === 0);
	$.assert(x => x(segmentNearestPoint([54, 0], ...segments)) === 0);
	$.assert(x => x(segmentNearestPoint([56, 0], ...segments)) === 1);
	$.assert(x => x(segmentNearestPoint([72, 27], ...segments)) === 1);
	$.assert(x => x(segmentNearestPoint([73, 28], ...segments)) === 2);
	$.assert(x => x(segmentNearestPoint([0, 1], ...segments)) === 5);
});
