/**
 * Converts an array of items to an object where the keys are the items and the values are the items' indexes.
 */
export function indexesByValues<ListItem extends string>(
	...input: Array<ListItem>
) {
	const out = {} as Record<ListItem, number>;
	for (let index = 0, length = input.length; index < length; index += 1) {
		out[input[index]] = index;
	}
	return out;
}
