/**
 * Given an object, returns a new object with keys that are based on the old ones and strongly-typed. https://stackoverflow.com/a/68546630
 * @template Value
 * @template {Record<string, unknown>} Source
 * @template {PropertyKey} NewKey
 * @template {unknown} NewValue
 * @param {Source} source
 * @param {(
 * oldKey: keyof Source,
 * oldValue: Source[oldKey]
 * ) => ([NewKey, NewValue])} mapper
 * @returns {Record<NewKey, NewValue>}
 */
export function mapObject(source, mapper) {
	const out = /** @type {Record<NewKey, NewValue>} */({});
	for (const oldKey in source) {
		const [newKey, newValue] = mapper(oldKey, source[oldKey]);
		out[newKey] = newValue;
	}
	return out;
}
