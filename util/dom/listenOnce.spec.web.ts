import { test } from '../spec/index';

import { listenOnce } from './listenOnce';

export const spec = test(import.meta.url, async $ => {
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
