import { pipeFilter } from './filter';
import type { PipeFunction } from '../emitter';

/**
 * Emits the source when the given property changes
 */
export function pipeOn<State, PropertyName extends keyof State>(
	property: PropertyName | ((state: State) => State[PropertyName]),
): PipeFunction<State, State> {
	const getValue = typeof property === `function`
		? property
		: (state: State) => state?.[property];

	return pipeFilter<State>(
		(value, { previous }) => getValue(value) !== getValue(previous),
	);
}
