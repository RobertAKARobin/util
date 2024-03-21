import { IGNORE, type PipeFunction, type SubscriptionEvent } from '../emitter.ts';

/**
 * Emits the source only when the given condition is met
 */
export function pipeFilter<State>(
	filter: PipeFunction<State, boolean>,
): PipeFunction<State, State> {
	return function(...[value, meta]: SubscriptionEvent<State>) {
		if (filter(value, meta) === true) {
			return value;
		}

		return IGNORE as unknown as State;
	};
}
