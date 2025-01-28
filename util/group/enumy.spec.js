import { test } from '../spec/index';

import { enumy } from './enumy';

export const spec = test(import.meta.url, $ => {
	const subject = enumy(`alice`, `bob`, `carol`);
	$.assert(x => x(subject.alice) === `alice`);
	$.assert(x => x(subject.bob) === `bob`);
	$.assert(x => x(subject.carol) === `carol`);
});
