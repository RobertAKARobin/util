import { test } from '../spec/index.js';

import { cssUnit } from './cssUnit.js';

export const spec = test(import.meta.url, $ => {
	let subject = cssUnit.px(32);
	$.assert(x => x(`${subject}`) === `32px`);

	$.assert(x => x(subject.value += 10) === 42);
	$.assert(x => x(`${subject}`) === `42px`);

	subject.unit = `rem`;
	$.assert(x => x(`${subject}`) === `42rem`);

	$.assert(x => x(`${cssUnit.px(Infinity)}`) === `Infinitypx`);
});
