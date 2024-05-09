import { test } from '../spec/index.ts';

import { omit } from './omit.ts';

export const spec = test(import.meta.url, $ => {
	const subject = { alice: `aaa`, bob: `bbb`, carol: `ccc` };
	$.assert(x => x(`alice` in omit(subject, `alice`)) === false);
	$.assert(x => x(`bob` in omit(subject, `alice`)));
	$.assert(x => x(`carol` in omit(subject, `alice`)));
});
