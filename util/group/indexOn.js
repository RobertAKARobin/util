/**
 * Given an array of items and a property of those items, return a dict where each item is a value and its key is its value for that property
 * @template {object} Type
 * @param {Iterable<Type>} inputs
 * @param {keyof Type} key
 * @returns {Record<string, Type>}
 */
export function indexOn(inputs, key) {
	const out = /** @type {Record<string, Type>} */({});
	for (const input of inputs) {
		if (key in input === false) {
			throw new Error(`Property '${key.toString()}' missing`);
		}

		const value = /** @type {string} */(input[key]);
		out[value] = input;
	}
	return out;
}
