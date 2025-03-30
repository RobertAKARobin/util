/**
 * @template [Value=string]
 * @param {Value} origin
 * @param {Value} update
 * @returns {boolean}
 */
export function findOverlapCompareDefault(origin, update) {
	return (
		origin !== undefined
		&& update !== undefined
		&& origin === update
	);
}

const newOverlap = () => /** @type {Overlap} */({
	length: 0,
	originIndex: -1,
	updateIndex: -1,
});

/**
 * @typedef {{length: number; originIndex: number; updateIndex: number}} Overlap
 */

/**
 * Given two arrays, find the segments of those arrays that overlap
 * @template [Value=string]
 * @param {Array<Value>} origin
 * @param {Array<Value>} update
 * @param {object} [options]
 * @param {(origin: Value, update: Value) => boolean} [options.compare] - Function that tests whether two items in the arrays are the same
 * @returns {Array<Overlap>}
 */
export function findOverlap(origin, update, options = {}) {
	const results = /** @type {Array<Overlap>} */([]);

	const compare = options.compare ?? findOverlapCompareDefault;

	let originIndex = 0;
	let updateIndex = 0;
	let overlap = newOverlap();
	while (true) {
		const originItem = origin[originIndex];
		const updateItem = update[updateIndex];

		if (compare(originItem, updateItem)) {
			if (overlap.length === 0) {
				overlap.originIndex = originIndex;
				overlap.updateIndex = updateIndex;
			}

			overlap.length += 1;

			originIndex += 1;
			updateIndex += 1;
		} else {
			if (overlap.length > 0) {
				results.push(overlap);
				overlap = newOverlap();
			}

			updateIndex += 1;

			if (updateIndex >= update.length) {
				originIndex += 1;
				updateIndex = 0;
			}
		}

		if (originIndex >= origin.length) {
			break;
		}
	}

	if (overlap.length > 0) { // Happens when the strings end with an overlap
		results.push(overlap);
	}

	return results;
}
