import { Emitter, IGNORE, type PipeFunction, type SubscriptionEvent } from '../emitter.ts';
import { pipeFirst } from './first.ts';

export function pipeUntil<State>(
	condition: EventTarget,
	eventName: keyof HTMLElementEventMap,
): PipeFunction<State, State>;
export function pipeUntil<State, Target extends EventTarget>(
	condition: Target,
	eventName: keyof Target,
): PipeFunction<State, State>;
export function pipeUntil<State>(
	condition: Emitter<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
): PipeFunction<State, State>;
export function pipeUntil<State>(
	condition: ((...args: SubscriptionEvent<State>) => boolean)
): PipeFunction<State, State>;
export function pipeUntil<State>(
	condition:
		| Emitter<unknown>
		| EventTarget
		| ((...args: SubscriptionEvent<State>) => boolean),
	eventName?: unknown
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
			{ once: true }
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
