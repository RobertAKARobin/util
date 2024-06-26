import { Emitter, IGNORE, type PipeFunction, type SubscriptionEvent } from '../emitter.ts';
import { pipeFirst } from './first.ts';

/**
 * Waits for the given EventTarget to emit an event with the specified name, then starts emitting the source
 */
export function pipeUntil<State, Target extends EventTarget>(
	target: Target,
	eventName: keyof HTMLElementEventMap | keyof Target,
): PipeFunction<State, State>;
/**
 * Waits for another Emitter to emit, then starts emitting the source
 */
export function pipeUntil<State>(
	target: Emitter<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
): PipeFunction<State, State>;
/**
 * Checks source emissions to see if the specified condition is met, and once it is, starts emitting the source
 */
export function pipeUntil<State>(
	condition: ((...args: SubscriptionEvent<State>) => boolean)
): PipeFunction<State, State>;
export function pipeUntil<State>(
	condition:
		| Emitter<unknown>
		| EventTarget
		| ((...args: SubscriptionEvent<State>) => boolean),
	eventName?: unknown,
): PipeFunction<State, State> {
	let shouldCancel = false;

	if (condition instanceof Emitter) {
		condition.pipe(pipeFirst(1)).subscribe(() => {
			shouldCancel = true;
		});
	} else if (condition instanceof EventTarget) {
		condition.addEventListener(
			eventName as string,
			() => shouldCancel = true,
			{ once: true },
		);
	}

	return function(...[value, meta]: SubscriptionEvent<State>) {
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
