import { test } from '../spec/index';

import { arrayCoerce } from './arrayCoerce';

export const spec = test(import.meta.url, $ => {
	const subject = [`foo`];
	$.assert(x => x(arrayCoerce(subject)) === subject);
	$.assert(x => x(arrayCoerce(subject[0]).join(` `)) === `foo`);
});
