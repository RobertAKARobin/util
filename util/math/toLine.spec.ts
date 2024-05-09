import { test } from '../spec/index.ts';

import { toLine } from './toLine.ts';

export const spec = test(`toLine`, $ => {
	const subject = [[1, 2], [9, 8], [3, 5]];
	$.assert(x => x(toLine(subject).begin.x) === 1);
	$.assert(x => x(toLine(subject).begin.y) === 2);
	$.assert(x => x(toLine(subject).end.x) === 3);
	$.assert(x => x(toLine(subject).end.y) === 5);
});
