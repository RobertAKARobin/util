import { defer } from './defer.ts';
import { test } from './spec/index.ts';

export const spec = test(`defer`, async $ => {
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
