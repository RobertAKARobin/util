export function toKeys<Key extends number | string | symbol, Fill>(
	input: Array<Key> | Readonly<Array<Key>>,
	fill: Fill
) {
	const output = {} as Record<Key, Fill>;
	for (const key of input) {
		output[key] = fill;
	}
	return output;
}
