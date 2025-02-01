import { test } from '../spec/index';

import { runContext } from './context';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(runContext) === `browser`);
});
