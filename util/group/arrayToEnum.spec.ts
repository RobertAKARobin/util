import { test } from '../spec/index.ts';

import { arrayToEnum } from './arrayToEnum.ts';

export const spec = test(import.meta.url, $ => {
	const subject = arrayToEnum([`alice`, `bob`, `carol`]);
	$.assert(x => x(subject[0]) === `alice`);
	$.assert(x => x(subject.alice) === 0);
	$.assert(x => x(subject[1]) === `bob`);
	$.assert(x => x(subject.bob) === 1);
	$.assert(x => x(subject[2]) === `carol`);
	$.assert(x => x(subject.carol) === 2);
});
