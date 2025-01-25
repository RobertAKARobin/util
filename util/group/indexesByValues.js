/**
 * Converts an array of items to an object where the keys are the items and the values are the items' indexes.
 * @template {string} ListItem
 * @param {Array<ListItem>} input
 * @returns {Record<ListItem, number>}
 */
export function indexesByValues(...input) {
	const out = /** @type {Record<ListItem, number>} */({});
	for (let index = 0, length = input.length; index < length; index += 1) {
		out[input[index]] = index;
	}
	return out;
}
