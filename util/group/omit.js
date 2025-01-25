/**
 * Given an object and some keys, returns a new object created from the given one with the keys removed
 * @template Source
 * @template {Array<keyof Source>} Keys
 * @param {Source} source
 * @param {Keys} keys
 * @returns {Omit<Source, Keys[number]>}
 */
export function omit(source, ...keys) {
	const output = { ...source };
	for (const key of keys) {
		delete output[key];
	}
	return output;
}
