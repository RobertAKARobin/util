import { test } from '../spec/index';

import { arrayToDict } from './arrayToDict';

export const spec = test(import.meta.url, $ => {
	const subject = arrayToDict([`foo`, `bar`], `baz`);
	$.assert(x => x(subject.foo) === `baz`);
	$.assert(x => x(subject.bar) === `baz`);
});
