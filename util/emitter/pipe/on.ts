import type { PipeFunction } from '../types.d.ts';

import { pipeFilter } from './filter';

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
