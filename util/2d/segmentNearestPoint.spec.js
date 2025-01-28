import { test } from '../spec/index';

import { segmentNearestPoint } from './segmentNearestPoint';
import segments from '../mock/segments.json' with { type: 'json' };

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(segmentNearestPoint([0, 0], ...segments)) === 0);
	$.assert(x => x(segmentNearestPoint([5, 5], ...segments)) === 0);
	$.assert(x => x(segmentNearestPoint([25, 0], ...segments)) === 0);
	$.assert(x => x(segmentNearestPoint([54, 0], ...segments)) === 0);
	$.assert(x => x(segmentNearestPoint([56, 0], ...segments)) === 1);
	$.assert(x => x(segmentNearestPoint([72, 27], ...segments)) === 1);
	$.assert(x => x(segmentNearestPoint([73, 28], ...segments)) === 2);
	$.assert(x => x(segmentNearestPoint([0, 1], ...segments)) === 5);
	$.assert(x => x(segmentNearestPoint([4, 39], ...segments)) === 5);
});
