/**
 * @import { PipeFunction, SubscriptionEvent } from '../types.d';
 */

import { Emitter, IGNORE } from '../emitter';
import { pipeFirst } from './first';

/**
 * Waits for the given EventTarget to emit an event with the specified name, then starts emitting the source
 * @template State
 * @template {EventTarget} Target
 * @overload
 * @param {Target} target
 * @param {keyof HTMLElementEventMap | keyof Target} eventName
 * @returns {PipeFunction<State, State>}
 */
/**
 * Waits for another Emitter to emit, then starts emitting the source
 * @template State
 * @overload
 * @param {Emitter<any>} target
 * @returns {PipeFunction<State, State>}
 */
/**
 * Checks source emissions to see if the specified condition is met, and once it is, starts emitting the source
 * @template State
 * @overload
 * @param {((...args: SubscriptionEvent<State>) => boolean)} condition
 * @returns {PipeFunction<State, State>}
 */
/**
 * @template State
 * @param {Emitter<unknown> | EventTarget | ((...args: SubscriptionEvent<State>) => boolean)} condition
 * @param {unknown} eventName
 * @returns {PipeFunction<State, State>}
 */
export function pipeUntil(condition, eventName = undefined) {
	let shouldCancel = false;

	if (condition instanceof Emitter) {
		condition.pipe(pipeFirst(1)).subscribe(() => {
			shouldCancel = true;
		});
	} else if (condition instanceof EventTarget) {
		condition.addEventListener(
			/** @type {string} */(eventName),
			() => shouldCancel = true,
			{ once: true },
		);
	}

	return function(...[value, meta]) {
		if (typeof condition === `function`) {
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
