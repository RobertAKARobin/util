import { test } from '../spec/index';

import { indexesByValues } from './indexesByValues';

export const spec = test(import.meta.url, $ => {
	const subject = indexesByValues(`alice`, `bob`, `carol`);
	$.assert(x => x(subject.alice) === 0);
	$.assert(x => x(subject.bob) === 1);
	$.assert(x => x(subject.carol) === 2);
});
