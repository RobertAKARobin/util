import { test } from '../spec/index.ts';

import { capitalize } from './capitalize.ts';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(capitalize(`foo`)) === `Foo`);
	$.assert(x => x(capitalize(`fOO`)) === `Foo`);
});
