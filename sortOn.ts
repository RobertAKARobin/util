export function sortOn<Value>(
	input: Array<Value>,
	comparer: (value: Value) => number | undefined
) {
	return [...input].sort((a, b) => {
		const aValue = comparer(a) ?? -1;
		const bValue = comparer(b) ?? -1;
		if (aValue > bValue) {
			return -1;
		} else if (aValue < bValue) {
			return 1;
		}
		return 0;
	});
}
