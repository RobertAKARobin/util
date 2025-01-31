import { defer } from './defer';
import { test } from '../spec/index';

export const spec = test(import.meta.url, async $ => {
	const deferred = /** @type {ReturnType<typeof defer<number>>} */(defer());
	$.assert(() => deferred instanceof Promise);
	$.assert(() => deferred.isResolved === false);

	await /** @type {Promise<void>} */(new Promise(resolve => {
		void deferred.then(value => {
			$.assert(x => x(value) === 3);
			$.assert(x => x(deferred.isResolved));
			resolve();
		});

		deferred.resolve(3);
	}));
});
