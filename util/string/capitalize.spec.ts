import { test } from '../spec/index.ts';

import { capitalize } from './capitalize.ts';

export const spec = test(`Capitalize`, $ => {
	$.assert(x => x(capitalize(`foo`)) === `Foo`);
});
