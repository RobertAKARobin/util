import type { PipeFunction, SubscriptionEvent } from '../emitter.ts';

export function first<State>(
	limit: number = 1
): PipeFunction<State, State> {
	let count = 0;

	return function(...[value, meta]: SubscriptionEvent<State>) {
		count += 1;

		if (count >= limit) {
			const { emitter, handler } = meta;
			emitter.unsubscribe(handler);
		}

		return value;
	};
}
