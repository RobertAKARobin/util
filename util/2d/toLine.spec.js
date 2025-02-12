import { test } from '../spec/index.js';

import { toLine } from './toLine.js';

export const spec = test(import.meta.url, $ => {
	const subject = [[1, 2], [9, 8], [3, 5]];
	$.assert(x => x(toLine(subject).begin.x) === 1);
	$.assert(x => x(toLine(subject).begin.y) === 2);
	$.assert(x => x(toLine(subject).end.x) === 3);
	$.assert(x => x(toLine(subject).end.y) === 5);
});
