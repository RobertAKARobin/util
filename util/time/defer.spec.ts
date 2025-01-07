import { defer } from './defer';
import { test } from '../spec/index';

export const spec = test(import.meta.url, async $ => {
	const deferred = defer<number>();
	$.assert(() => deferred instanceof Promise);
	$.assert(() => deferred.isResolved === false);

	await new Promise<void>(resolve => {
		void deferred.then(value => {
			$.assert(x => x(value) === 3);
			$.assert(x => x(deferred.isResolved));
			resolve();
		});

		deferred.resolve(3);
	});
});
