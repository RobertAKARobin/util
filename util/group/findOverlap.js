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

/**
 * @typedef {{length: number; originIndex: number; updateIndex: number}} Overlap
 */

/**
 * Given two arrays, find the first slices of those arrays that overlap
 * @template [Value=string]
 * @param {Array<Value>} origin
 * @param {Array<Value>} update
 * @param {object} [options]
 * @param {(origin: Value, update: Value) => boolean} [options.compare] - Function that tests whether two items in the arrays are the same
 * @returns {Overlap}
 */
export function findOverlap(origin, update, options = {}) {
	const result = {
		length: 0,
		originIndex: -1,
		updateIndex: -1,
	};

	const compare = options.compare ?? findOverlapCompareDefault;

	const originLength = origin.length;
	const updateLength = update.length;

	(function() {
		let originIndex = 0;
		while (originIndex < originLength) {
			const originItem = origin[originIndex];

			let updateIndex = 0;
			while (updateIndex < updateLength) {
				const updateItem = update[updateIndex];

				if (compare(originItem, updateItem)) {
					result.originIndex = originIndex;
					result.updateIndex = updateIndex;
					return;
				}

				updateIndex += 1;
			}

			originIndex += 1;
		}
	})();

	if (result.originIndex === -1) {
		return result;
	}

	(function() {
		let length = 1; // Not starting at 0 becuase we know the chunks at that index will be the same

		while (true) {
			const originItem = origin[result.originIndex + length];
			const updateItem = update[result.updateIndex + length];

			if (compare(originItem, updateItem) === false) {
				result.length = length;
				return;
			}

			length += 1;
		}
	})();

	return result;
}

/**
 * Given two arrays, find all slices of the two arrays that overlap. @see {@link findOverlap}
 * @param {Parameters<findOverlap>[0]} origin
 * @param {Parameters<findOverlap>[1]} update
 * @param {Parameters<findOverlap>[2]} options
 * @returns {Array<ReturnType<findOverlap>>}
 */
export function findOverlaps(origin, update, options = {}) {
	let originRemaining = [...origin];
	const overlaps = /** @type {Array<Overlap>} */([]);

	let originOffset = 0;
	while (true) {
		const overlap = findOverlap(originRemaining, update, options);

		if (overlap.length === 0) {
			break;
		}

		overlap.originIndex += originOffset;
		overlaps.push(overlap);

		const sliceFrom = originOffset + overlap.length;
		originRemaining = originRemaining.slice(sliceFrom);
		originOffset += sliceFrom;
	}

	return overlaps;
}
