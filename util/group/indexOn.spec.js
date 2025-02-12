import { test } from '../spec/index.js';

import { indexOn } from './indexOn.js';

export const spec = test(import.meta.url, $ => {
	const items = [
		{ name: `alice` },
		{ name: `bob` },
		{ name: `carol` },
	];
	const subject = indexOn(items, `name`);
	$.assert(x => x(subject.alice) === x(items[0]));
	$.assert(x => x(subject.bob) === x(items[1]));
	$.assert(x => x(subject.carol) === x(items[2]));
});
