/**
 * Returns a comparer function suitable for use in `.sort`.
 * Note that `.sort` modifies the original array. If you don't want to modify the original array then map it to a new array, e.g. `[...myArray].sort(sortOn(...))`.
 * @template Value
 * @param {(value: Value) => boolean | number | string} comparer
 * @returns {Parameters<Array<Value>['sort']>[0]}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort}
 */
export function sortOn(comparer) {
	return (
		/** @type {Value} */a,
		/** @type {Value} */b,
	) => {
		const aValue = comparer(a) ?? -1;
		const bValue = comparer(b) ?? -1;
		if (aValue > bValue) {
			return 1;
		} else if (aValue < bValue) {
			return -1;
		}
		return 0;
	};
}
