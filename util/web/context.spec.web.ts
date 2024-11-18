import { test } from '../spec/index.ts';

import { runContext } from './context.ts';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(runContext) === `browser`);
});
