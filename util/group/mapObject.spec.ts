import { test } from '../spec/index.ts';

import { mapObject } from './mapObject.ts';

export const spec = test(`mapObject`, $ => {
	const source = {
		alice: `aaa`,
		bob: `bbb`,
		carol: `ccc`,
	} as const;
	const subject = mapObject(source, (key, value) => [value, key]);
	$.assert(x => x(subject.aaa) === `alice`);
	$.assert(x => x(subject.bbb) === `bob`);
	$.assert(x => x(subject.ccc) === `carol`);
});
