/**
 * @import { PipeFunction } from '../types.d';
 */

import { pipeFilter } from './filter.js';

/**
 * Emits the source when the given property changes
 * @template State
 * @template {keyof State} PropertyName
 * @param {PropertyName | ((state: State) => State[PropertyName])} property
 * @returns {PipeFunction<State, State>}
 */
export function pipeOn(property) {
	const getValue = typeof property === `function`
		? property
		: (/** @type {State} */state) => state?.[property];

	return pipeFilter(
		(value, { previous }) => getValue(value) !== getValue(previous),
	);
}
