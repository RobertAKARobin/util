/**
 * Given an array of names, and a "fill", create a dict where the keys are the names and the values are the fill
 */
export function arrayToDict<Key extends number | string | symbol, Fill>(
	input: Array<Key> | Readonly<Array<Key>>,
	fill: Fill
) {
	const output = {} as Record<Key, Fill>;
	for (const key of input) {
		output[key] = fill;
	}
	return output;
}
