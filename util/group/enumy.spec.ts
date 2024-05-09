import { test } from '../spec/index.ts';

import { enumy } from './enumy.ts';

export const spec = test(import.meta.url, $ => {
	const subject = enumy(`alice`, `bob`, `carol`);
	$.assert(x => x(subject.alice) === `alice`);
	$.assert(x => x(subject.bob) === `bob`);
	$.assert(x => x(subject.carol) === `carol`);
});
