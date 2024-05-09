import { test } from '../spec/index.ts';

import { soFar } from './soFar.ts';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(isNaN(soFar())));
	$.assert(x => x(soFar()) > 0);
	$.assert(x => x(soFar()) < 1); // If ever this is not true then something's seriously wonky with the system
	$.assert(x => x(isNaN(soFar(0))));
});
