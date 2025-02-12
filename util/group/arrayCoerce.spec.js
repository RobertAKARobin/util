import { test } from '../spec/index.js';

import { arrayCoerce } from './arrayCoerce.js';

export const spec = test(import.meta.url, $ => {
	const subject = [`foo`];
	$.assert(x => x(arrayCoerce(subject)) === subject);
	$.assert(x => x(arrayCoerce(subject[0]).join(` `)) === `foo`);
});
