import { test } from '../spec/index.js';

import { plural } from './pluralize.js';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(plural(`banana`)) === `bananas`);
	$.assert(x => x(plural(`Banana`)) === `Bananas`);
	$.assert(x => x(plural(`James`)) === `James`);
	$.assert(x => x(plural(`James'`)) === `James's`);
	$.assert(x => x(plural(``)) === `s`);
});
