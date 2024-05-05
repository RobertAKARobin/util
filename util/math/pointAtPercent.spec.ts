import { test } from '../spec/index.ts';

import { pointAtPercent } from './pointAtPercent.ts';
import segments from '../mock/segments.json';

export const spec = test(`pointAtPercent`, $ => {
	const points = segments[1];
	const subject = pointAtPercent(.5, ...points);
	$.assert(x => x(subject.x) === 40);
	$.assert(x => x(subject.y) === 28.75); // FYI this handle's Y is _not_ equidistant between the start and endpoint
});
