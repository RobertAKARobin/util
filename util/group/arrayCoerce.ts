import type { OneOrMany } from '../types.d.ts';

/**
 * Converts an item to an array, if it isn't one already
 */
export function arrayCoerce<Value>(input: OneOrMany<Value>): Array<Value> {
	return (input instanceof Array ? input : [input]);
}
