/**
 * @import { PipeFunction, SubscriptionEvent } from '../types.d';
 */

/**
 * Emits the source up to `$limit` times. Default `1`
 * @template State
 * @param {number} limit
 * @returns {PipeFunction<State, State>}
 */
export function pipeFirst(limit = 1) {
	let count = 0;

	return function(...[value, meta]) {
		count += 1;

		if (count >= limit) {
			const { emitter, handler } = meta;
			emitter.unsubscribe(handler);
		}

		return value;
	};
}
