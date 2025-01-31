import { test } from '../spec/index';

import { listenOnce } from './listenOnce';

class Subject extends EventTarget {
	click() {
		this.dispatchEvent(new Event(`click`));
	}
}

export const spec = test(import.meta.url, async $ => {
	const subject = new Subject();
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
