import { suite, test } from '@robertakarobin/spec';

import { Emitter } from './index.ts';

export const spec = suite(`@robertakarobin/emit`,
	{
		args: () => {
			Emitter.subscriptions.clear();
			return {
				emitter: new Emitter<number>(),
				emitter2: new Emitter<number>(),
			};
		},
	},

	test(`.subscriptions`, $ => {
		$.assert(x => x(Emitter.subscriptions.size) === 0);
		$.assert(x => x($.args.emitter.subscriptions.size) === 0);
		$.assert(x => x($.args.emitter2.subscriptions.size) === 0);
	}),

	test(`#subscribe`, $ => {
		$.log(`subscription 1`);
		$.args.emitter.subscribe();
		$.assert(x => x(Emitter.subscriptions.size) === 1);
		$.assert(x => x($.args.emitter.subscriptions.size) === 1);
		$.assert(x => x($.args.emitter2.subscriptions.size) === 0);

		$.log(`subscription 2`);
		$.args.emitter2.subscribe();
		$.assert(x => x(Emitter.subscriptions.size) === 2);
		$.assert(x => x($.args.emitter.subscriptions.size) === 1);
		$.assert(x => x($.args.emitter2.subscriptions.size) === 1);
	})
);
