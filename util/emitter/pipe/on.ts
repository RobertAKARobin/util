import { filter } from './filter.ts';
import type { OnEmit } from '../emitter.ts';

export function on<State, PropertyName extends keyof State>(
	property: PropertyName | ((state: State) => State[PropertyName])
): OnEmit<State> {
	const getValue = typeof property === `function`
		? property
		: (state: State) => state[property];

	return filter<State>(
		(state, previous) => getValue(state) !== getValue(previous)
	);
}
