/**
 * Given an object, returns a new object with keys that are based on the old ones and strongly-typed. https://stackoverflow.com/a/68546630
 */
export function mapObject<
	Value,
	Source extends Record<string, Value>,
	NewKey extends PropertyKey,
>(
	source: Source,
	mapper: (
		oldKey: keyof Source,
		oldValue: Source[typeof oldKey],
	) => ([NewKey, Value]),
) {
	const out = {} as Record<NewKey, Value>;
	for (const oldKey in source) {
		const [newKey, newValue] = mapper(oldKey, source[oldKey]);
		out[newKey] = newValue;
	}
	return out;
}
