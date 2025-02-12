/**
 * @import { PipeFunction, SubscriptionEvent } from '../types.d';
 */

import { IGNORE } from '../emitter.js';

/**
 * Emits the source only when the given condition is met
 * @template State
 * @param {PipeFunction<State, boolean>} filter
 * @returns {PipeFunction<State, State>}
 */
export function pipeFilter(filter) {
	return function(...[value, meta]) {
		if (filter(value, meta) === true) {
			return value;
		}

		return IGNORE;
	};
}
