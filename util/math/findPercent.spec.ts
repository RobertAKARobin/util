import { test } from '../spec/index.ts';

import { findPercent } from './findPercent.ts';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(findPercent(pct => Math.abs((100 * pct) - 45))) === .45);
	$.assert(x => x(findPercent(pct => Math.abs((123 * pct) - 45))) === .37);
});
