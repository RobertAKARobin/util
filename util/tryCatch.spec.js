import { test } from './spec/index.js';

import { tryCatch } from './tryCatch.js';

export const spec = test(import.meta.url, $ => {
	$.assert(() => tryCatch(() => 42) === 42);

	class MyError extends Error {}
	const throwMyError = () => {
		throw new MyError();
		return 1;
	};

	$.assert(() => tryCatch(throwMyError) instanceof MyError);
	$.assert(() => tryCatch(throwMyError, 42) === 42);
});
