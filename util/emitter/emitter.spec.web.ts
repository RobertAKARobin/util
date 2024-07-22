import { suite, test } from '../spec/index.ts';

import { Emitter } from './emitter.ts';
import { pipeUntil } from './pipe/until.ts';

export const spec = suite(import.meta.url, {},
	test(`fromEvent`, $ => {
		const button = document.createElement(`button`);
		let count = 0;

		const onClick = Emitter.fromEvent(button, `click`);
		const subscription = onClick.subscribe(() => count += 1);

		$.log(() => button.click());
		$.assert(x => x(count) === 1);
		$.log(() => button.click());
		$.assert(x => x(count) === 2);
		$.log(() => subscription.unsubscribe());
		$.log(() => button.click());
		$.assert(x => x(count) === 2);
	}),

	suite(`pipes`, {},
		suite(`until`, {},
			test(`eventTarget`, $ => {
				const emitter = new Emitter(0);
				const button = document.createElement(`button`);
				const piped = emitter.pipe(pipeUntil(button, `click`));

				$.log(() => emitter.set(1));
				$.assert(x => x(piped.value) === 1);

				$.log(() => button.click());
				$.log(() => emitter.set(2));
				$.assert(x => x(piped.value) === 1);

				$.assert(x => x(emitter.handlers.size) === 0);
				$.assert(x => x(piped.handlers.size) === 0);
			}),
		),
	),
);
