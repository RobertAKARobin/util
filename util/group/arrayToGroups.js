/**
 * Creates an array of arrays, where the items are the given array's items grouped into smaller arrays of the specified size
 * @template Value
 * @param {number} size
 * @param {Array<Value>} items
 * @returns {Array<Array<Value>>}
 */
export function arrayToGroups(size, items) {
	const groups = [];

	let group = [];
	let count = 0;
	for (const item of items) {
		count += 1;

		group.push(item);

		if (count % size === 0 || count === items.length) {
			groups.push(group);
			group = [];
		}
	}

	return groups;
}
