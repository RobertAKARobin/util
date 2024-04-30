import './dummydom.ts';
import { test } from '../spec/index.ts';

import { listenOnce } from './listenOnce.ts';

export const spec = test(`listenOnce`, async $ => {
	const subject = document.createElement(`div`);
	let emitCount = 0;

	subject.click();
	$.assert(x => x(emitCount) === 0);

	const didEmit = listenOnce(subject, `click`).then(() => emitCount += 1);

	subject.click();
	await didEmit;
	$.assert(x => x(emitCount) === 1);

	subject.click();
	$.assert(x => x(emitCount) === 1);
});
