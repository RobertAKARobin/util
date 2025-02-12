import { test } from '../spec/index.js';

import { listenOnce } from './listenOnce.js';

export const spec = test(import.meta.url, async $ => {
	const subject = document.createElement(`div`);
	let emitCount = 0;

	subject.click();
	$.assert(x => x(emitCount) === 0);

	const event = listenOnce(subject, `click`);
	const didEmit = event.then(() => emitCount += 1);

	subject.click();
	await didEmit;
	$.assert(x => x(emitCount) === 1);

	subject.click();
	$.assert(x => x(emitCount) === 1);
});
