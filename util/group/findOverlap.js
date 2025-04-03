/**
 * @template [Value=string]
 * @param {Value} inputA
 * @param {Value} inputB
 * @returns {boolean}
 */
export function findOverlapDefaultCompare(inputA, inputB) {
	return inputA === inputB;
}

/**
 * @template [Value=string]
 * @param {Value} input
 * @returns {boolean}
 */
export function findOverlapDefaultFilter(input) {
	return input !== undefined;
}

const newOverlap = () => ({
	indexA: -1,
	indexB: -1,
	length: 0,
});

/**
 * @typedef {ReturnType<typeof newOverlap>} Overlap
 */

/**
 * Given two arrays, find a segment of those arrays that overlaps
 * @template [Value=string]
 * @param {Array<Value>} inputA
 * @param {Array<Value>} inputB
 * @param {object} [options]
 * @param {typeof findOverlapDefaultCompare<Value>} [options.compare] - Function that tests whether two items in the arrays are the same
 * @param {typeof findOverlapDefaultFilter<Value>} [options.filter] - Function that tests whether an item can be considered for overlap
 * @returns {Overlap}
 */
export function findOverlap(inputA, inputB, options = {}) {
	if (inputA.length === 0 || inputB.length === 0) {
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

	const baseIsInputA = inputA.length > inputB.length;
	const [base, slider] = baseIsInputA ? [inputA, inputB] : [inputB, inputA];

	let index = 0;
	let sliderOffset = slider.length - 1;
	let overlap = newOverlap();
	let overlapLongest = newOverlap();
	let cycles = 0;
	while (true) {
		cycles += 1;
		const sliderIndex = index + sliderOffset;
		const baseItem = base[index];
		const sliderItem = slider[sliderIndex];

		// console.log([index, originItem, updateItem, updateIndex, updateOffset, overlapLongest.length]);

		if (filter(baseItem) === false) {
			overlapEnd();

		} else if (filter(sliderItem) === false) {
			overlapEnd();

		} else if (compare(baseItem, sliderItem)) {
			if (overlap.length === 0) {
				overlap.indexA = index;
				overlap.indexB = sliderIndex;
			}

			overlap.length += 1;

		} else {
			overlapEnd();
		}

		index += 1;

		if (sliderIndex + 1 >= slider.length) {
			// console.log(`->`);
			sliderOffset -= 1;
			index = Math.max(0, 0 - sliderOffset);
			overlapEnd();
		}

		if (index >= base.length) { // updateOffset ends up negative
			break;
		}
	}

	if (baseIsInputA === false) {
		const { indexA, indexB } = overlapLongest;
		overlapLongest.indexA = indexB;
		overlapLongest.indexB = indexA;
	}

	console.log(cycles);
	return overlapLongest;
}
