/**
 * @template [Value=string]
 * @param {Value} origin
 * @param {Value} update
 * @returns {boolean}
 */
export function findOverlapDefaultCompare(origin, update) {
	return origin === update;
}

/**
 * @template [Value=string]
 * @param {Value} input
 * @returns {boolean}
 */
export function findOverlapDefaultFilter(input) {
	return input !== undefined;
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
 * Given two arrays, find a segment of those arrays that overlaps
 * @template [Value=string]
 * @param {Array<Value>} origin
 * @param {Array<Value>} update
 * @param {object} [options]
 * @param {typeof findOverlapDefaultCompare<Value>} [options.compare] - Function that tests whether two items in the arrays are the same
 * @param {typeof findOverlapDefaultFilter<Value>} [options.filter] - Function that tests whether an item can be considered for overlap
 * @returns {Overlap}
 */
export function findOverlap(origin, update, options = {}) {
	const compare = options.compare ?? findOverlapDefaultCompare;
	const filter = options.filter ?? findOverlapDefaultFilter;

	function appendAndReset() {
		if (overlap.length > 0) {
			if (overlap.length > overlapLongest.length) {
				overlapLongest = overlap;
			}

			originIndex = overlap.originIndex;
			overlap = newOverlap();
		}
	}

	let originIndex = 0;
	let updateIndex = 0;
	let overlap = newOverlap();
	let overlapLongest = newOverlap();
	while (true) {
		const originItem = origin[originIndex];
		const updateItem = update[updateIndex];

		if (filter(originItem) === false) {
			appendAndReset();
			originIndex += 1;

		} else if (filter(updateItem) && compare(originItem, updateItem)) {
			if (overlap.length === 0) {
				overlap.originIndex = originIndex;
				overlap.updateIndex = updateIndex;
			}

			overlap.length += 1;
			originIndex += 1;

		} else {
			appendAndReset();
		}

		updateIndex += 1;

		if (updateIndex >= update.length) {
			appendAndReset();
			originIndex += 1;
			updateIndex = 0;
		}

		if (originIndex >= origin.length) {
			break;
		}
	}

	if (overlap.length > overlapLongest.length) {
		overlapLongest = overlap;
	}

	return overlapLongest;
}
