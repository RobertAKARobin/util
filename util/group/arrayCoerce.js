/**
 * @import {OneOrMany} from '../types.d.ts'
 */

/**
 * Converts an item to an array, if it isn't one already
 * @template Input
 * @param {OneOrMany<Input>} input
 * @returns {Array<Input>}
 */
export function arrayCoerce(input) {
	return (input instanceof Array ? input : [input]);
}
