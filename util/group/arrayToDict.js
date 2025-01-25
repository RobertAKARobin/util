/**
 * Given an array of names, and a "fill", create a dict where the keys are the names and the values are the fill
 * @template {number | string | symbol} Key
 * @template Fill
 * @param {Array<Key> | Readonly<Array<Key>>} input
 * @param {Fill} fill
 * @returns {Record<Key, Fill>}
 */
export function arrayToDict(input, fill) {
	const output = /** @type {Record<Key, Fill>} */ ({});
	for (const key of input) {
		output[key] = fill;
	}
	return output;
}
