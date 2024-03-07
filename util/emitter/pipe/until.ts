import { type Emitter, IGNORE, type PipeFunction, type SubscriptionEvent } from '../emitter.ts';
import { first } from './first.ts';

export function until<State>(
	emitter: Emitter<any> // eslint-disable-line @typescript-eslint/no-explicit-any
): PipeFunction<State, State> {
	let shouldCancel = false;

	emitter.pipe(first(1)).subscribe(() => {
		shouldCancel = true;
	});

	return function(...[value, meta]: SubscriptionEvent<State>) {
		if (shouldCancel) {
			const { emitter, handler } = meta;
			emitter.unsubscribe(handler);
			return IGNORE;
		}

		return value;
	};
}
