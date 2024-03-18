import { defer } from './defer.ts';
import { test } from './spec/index.ts';

export const spec = test(`defer`, async $ => {
	const value = defer<number>();
	$.assert(() => value instanceof Promise);

	await new Promise<void>(resolve => {
		void value.then(value => {
			$.assert(x => x(value) === 3);
			resolve();
		});

		value.resolve(3);
	});
});
