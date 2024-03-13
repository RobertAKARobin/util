/**
 * Sort an array by the result of a comparer function.
 * Note that this modifies the original array, like the native `.sort` function. If you don't want to modify the original array then map it to a new array, e.g. `sortOn([...myArray])`.
 */
export function sortOn<Value>(
	input: Array<Value>,
	comparer: (value: Value) => any // eslint-disable-line @typescript-eslint/no-explicit-any
) {
	return input.sort((a, b) => {
		const aValue = comparer(a) ?? -1; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
		const bValue = comparer(b) ?? -1; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
		if (aValue > bValue) {
			return 1;
		} else if (aValue < bValue) {
			return -1;
		}
		return 0;
	});
}
