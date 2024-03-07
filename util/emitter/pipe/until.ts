import { Emitter, IGNORE, type PipeFunction, type SubscriptionEvent } from '../emitter.ts';
import { first } from './first.ts';

export function until<State>(
	condition:
		| Emitter<any> // eslint-disable-line @typescript-eslint/no-explicit-any
		| ((...args: SubscriptionEvent<State>) => boolean),
): PipeFunction<State, State> {
	let shouldCancel = false;

	if (condition instanceof Emitter) {
		condition.pipe(first(1)).subscribe(() => {
			shouldCancel = true;
		});
	}

	return function(...[value, meta]: SubscriptionEvent<State>) {
		if (condition instanceof Emitter === false) {
			if (condition(value, meta)) {
				shouldCancel = true;
			}
		}

		if (shouldCancel) {
			const { emitter, handler } = meta;
			emitter.unsubscribe(handler);
			return IGNORE;
		}

		return value;
	};
}
