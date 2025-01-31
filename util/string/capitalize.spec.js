import { test } from '../spec/index';

import { capitalize } from './capitalize';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(capitalize(`foo`)) === `Foo`);
	$.assert(x => x(capitalize(`fOO`)) === `Foo`);
});
