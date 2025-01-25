/**
 * Given an object, returns a new object with keys that are based on the old ones and strongly-typed. https://stackoverflow.com/a/68546630
 * @template Value
 * @template {Record<string, Value>} Source
 * @template {PropertyKey} NewKey
 * @param {Source} source
 * @param {(
 * oldKey: keyof Source,
 * oldValue: Source[oldKey]
 * ) => ([NewKey, Value])} mapper
 * @returns {Record<NewKey, Value>}
 */
export function mapObject(source, mapper) {
	const out = /** @type {Record<NewKey, Value>} */({});
	for (const oldKey in source) {
		const [newKey, newValue] = mapper(oldKey, source[oldKey]);
		out[newKey] = newValue;
	}
	return out;
}
