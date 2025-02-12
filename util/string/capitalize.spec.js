import { test } from '../spec/index.js';

import { capitalize } from './capitalize.js';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(capitalize(`foo`)) === `Foo`);
	$.assert(x => x(capitalize(`fOO`)) === `Foo`);
});
