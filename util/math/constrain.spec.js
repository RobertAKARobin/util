import { test } from '../spec/index';

import { preciseTo } from './preciseTo';

import { constrain, constrainCircular } from './constrain';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(constrain(3, 2, 5)) === 3);
	$.assert(x => x(constrain(3, 3, 5)) === 3);
	$.assert(x => x(constrain(3, 4, 5)) === 4);
	$.assert(x => x(constrain(3, 5, 5)) === 5);
	$.assert(x => x(constrain(3, 6, 5)) === 5);
	$.assert(x => x(constrain(25, 5, 50)) === 25);

	$.assert(x => x(preciseTo(constrainCircular(-1, 360))) === 359);
	$.assert(x => x(preciseTo(constrainCircular(-1, 100))) === 99);
	$.assert(x => x(preciseTo(constrainCircular(-.1, 360))) === 359.9);
	$.assert(x => x(preciseTo(constrainCircular(-.1, 100))) === 99.9);
	$.assert(x => x(preciseTo(constrainCircular(0, 360))) === 0);
	$.assert(x => x(preciseTo(constrainCircular(0, 100))) === 0);
	$.assert(x => x(preciseTo(constrainCircular(360, 360))) === 0);
	$.assert(x => x(preciseTo(constrainCircular(360, 100))) === 60);
	$.assert(x => x(preciseTo(constrainCircular(360.1, 360))) === .1);
	$.assert(x => x(preciseTo(constrainCircular(360.1, 100))) === 60.1);
	$.assert(x => x(preciseTo(constrainCircular(361, 360))) === 1);
	$.assert(x => x(preciseTo(constrainCircular(721, 360))) === 1);
});
