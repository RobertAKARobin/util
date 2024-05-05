import { test } from '../spec/index.ts';

import { arrayCoerce } from './arrayCoerce.ts';

export const spec = test(`arrayCoerce`, $ => {
	const subject = [`foo`];
	$.assert(x => x(arrayCoerce(subject)) === subject);
	$.assert(x => x(arrayCoerce(subject[0]).join(` `)) === `foo`);
});
