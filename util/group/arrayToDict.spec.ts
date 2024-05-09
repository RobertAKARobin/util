import { test } from '../spec/index.ts';

import { arrayToDict } from './arrayToDict.ts';

export const spec = test(import.meta.url, $ => {
	const subject = arrayToDict([`foo`, `bar`], `baz`);
	$.assert(x => x(subject.foo) === `baz`);
	$.assert(x => x(subject.bar) === `baz`);
});
