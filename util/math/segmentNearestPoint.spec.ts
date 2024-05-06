import { test } from '../spec/index.ts';

import { segmentNearestPoint } from './segmentNearestPoint.ts';
import segments from '../mock/segments.json';

export const spec = test(`pointsToMidpoints`, $ => {
	// $.assert(x => x(segmentNearestPoint([25, 0], ...segments)) === 0);
	// $.assert(x => x(segmentNearestPoint([49, 0], ...segments)) === 0);
	$.assert(x => x(segmentNearestPoint([51, 0], ...segments)) === 1);
});
