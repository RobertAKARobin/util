import { test } from '../spec/index.js';

import { mapObject } from './mapObject.js';

export const spec = test(import.meta.url, $ => {
	const source = /** @type {const} */({
		alice: `aaa`,
		bob: `bbb`,
		carol: `ccc`,
	});
	const subject = mapObject(source, (key, value) => [value, key]);
	$.assert(x => x(subject.aaa) === `alice`);
	$.assert(x => x(subject.bbb) === `bob`);
	$.assert(x => x(subject.ccc) === `carol`);
});
