/**
 * Creates an array of arrays, where the items are the given array's items grouped into smaller arrays of the specified size
 */
export function arrayToGroups<Value>(size: number, items: Array<Value>) {
	const groups = [] as Array<Array<Value>>;

	let group = [] as Array<Value>;
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
