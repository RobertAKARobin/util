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
	if (origin.length === 0 || update.length === 0) {
		return newOverlap();
	}

	const compare = options.compare ?? findOverlapDefaultCompare;
	const filter = options.filter ?? findOverlapDefaultFilter;

	function overlapEnd() {
		if (overlap.length > 0) {
			if (overlap.length > overlapLongest.length) {
				overlapLongest = overlap;
			}

			overlap = newOverlap();
		}
	}

	let index = 0;
	let updateOffset = update.length - 1;
	let overlap = newOverlap();
	let overlapLongest = newOverlap();
	let cycles = 0;
	while (true) {
		cycles += 1;
		const originItem = origin[index];
		const updateIndex = index + updateOffset;
		const updateItem = update[updateIndex];

		// console.log([index, originItem, updateItem, updateIndex, updateOffset, overlapLongest.length]);

		if (filter(originItem) === false) {
			overlapEnd();

		} else if (filter(updateItem) === false) {
			overlapEnd();

		} else if (compare(originItem, updateItem)) {
			if (overlap.length === 0) {
				overlap.originIndex = index;
				overlap.updateIndex = updateIndex;
			}

			overlap.length += 1;

		} else {
			overlapEnd();
		}

		index += 1;

		if (updateOffset === 0 - origin.length + 1) {
			overlapEnd();
			break;
		}

		if (
			updateIndex >= update.length - 1
			|| index >= origin.length
		) {
			// console.log(`->`);
			updateOffset -= 1;
			index = Math.max(0, 0 - updateOffset);
			overlapEnd();
		}
	}

	// console.log(cycles);
	return overlapLongest;
}
