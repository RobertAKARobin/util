import { test } from '../spec/index.js';

import { pathRelative } from './pathRelative.js';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(pathRelative(`file:///`, `target`)) === `/target`);
	$.assert(x => x(pathRelative(`file:///root`, `target`)) === `/target`);
	$.assert(x => x(pathRelative(`file:///root/filename`, `target`)) === `/root/target`);
});
