import { test } from '../spec/index.ts';

import { PathNavigator } from './pathNavigator.ts';
import { pointAtPercent } from './pointAtPercent.ts';

export const spec = test(`pointAtPercent`, $ => {
	const path = document.querySelector(`path`)!;
	const pathData = path.getAttribute(`d`)!;
	const points = PathNavigator.fromData(pathData).segments[1];

	const subject = pointAtPercent(.5, ...points);
	$.assert(x => x(subject.x) === 40);
	$.assert(x => x(subject.y) === 28.75); // FYI this handle's Y is _not_ equidistant between the start and endpoint
});
