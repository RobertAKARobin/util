import { test } from '../spec/index.js';

import { runContext } from './context.js';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(runContext) === `browser`);
});
