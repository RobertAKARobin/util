/**
 * Literally just `Object.keys`, but strongly typed.
 * @template {Record<string | symbol, unknown>} Input
 * @template {keyof Input} Key
 * @param {Input} input
 * @returns {Array<Key>}
 */
export function keysOf(input) {
	return /** @type {Array<Key>} */(Object.keys(input));
}
