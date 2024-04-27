import { test } from '../spec/index.ts';

import { soFar } from './soFar.ts';

export const spec = test(`soFar`, $ => {
	$.assert(x => x(soFar()) === undefined);
	$.assert(x => x(soFar()!) > 0);
	$.assert(x => x(soFar()!) < 1); // If ever this is not true then something's seriously wonky with the system
	$.assert(x => x(soFar(0)) === 0);
});
