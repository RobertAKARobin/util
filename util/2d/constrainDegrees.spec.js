import { test } from '../spec/index';

import { preciseTo } from '../math/preciseTo';

import { constrainDegrees } from './constrainDegrees';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(preciseTo(constrainDegrees(-1))) === 359);
	$.assert(x => x(preciseTo(constrainDegrees(-.1))) === 359.9);
	$.assert(x => x(preciseTo(constrainDegrees(0))) === 0);
	$.assert(x => x(preciseTo(constrainDegrees(360))) === 0);
	$.assert(x => x(preciseTo(constrainDegrees(360.1))) === .1);
	$.assert(x => x(preciseTo(constrainDegrees(361))) === 1);
	$.assert(x => x(preciseTo(constrainDegrees(721))) === 1);
});
