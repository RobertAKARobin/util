import { test } from './spec/index.js';

import { tryCatch } from './tryCatch.js';

export const spec = test(import.meta.url, async $ => {
	$.assert(() => tryCatch(() => 42) === 42);

	class MyError extends Error {}
	const doThrow = (/** @type {boolean} */ doThrow) => () => {
		if (doThrow) {
			throw new MyError();
		}

		return 1;
	};

	const doThrowAsync = (/** @type {boolean} */ doThrow) => async() => {
		if (doThrow) {
			throw new MyError();
		}

		return Promise.resolve(1);
	};

	$.assert(() => tryCatch(doThrow(false)) === 1);
	$.assert(() => tryCatch(doThrow(true)) instanceof MyError);
	$.assert(() => tryCatch(doThrow(true), 42) === 42);

	$.assert(() => tryCatch(doThrowAsync(false)) instanceof Promise);
	await $.assert(async() => await tryCatch(doThrowAsync(false)) === 1);

	$.assert(() => tryCatch(doThrowAsync(true)) instanceof Promise);
	await $.assert(async() => await tryCatch(doThrowAsync(true)) instanceof MyError);

	$.assert(() => tryCatch(doThrowAsync(true)) instanceof Promise);
	await $.assert(async() => await tryCatch(doThrowAsync(true), 42) === 42);
});
