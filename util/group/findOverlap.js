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

	const baseIsInputA = inputA.length > inputB.length;
	const [base, slider] = baseIsInputA ? [inputA, inputB] : [inputB, inputA]; // Sorting should ensure that if overlaps tie for longest, the earliest is returned. More efficient than checking indexes on each overlapEnd

	let index = 0;
	let sliderOffset = slider.length - 1;
	let overlap = newOverlap();
	let overlapLongest = newOverlap();

	function slideForward() {
		overlap = newOverlap();
		sliderOffset -= 1;
		index = sliderOffset > 0 ? 0 : 0 - sliderOffset;
	}

	while (true) {
		const sliderIndex = index + sliderOffset;
		const baseItem = base[index];
		const sliderItem = slider[sliderIndex];

		if (filter(baseItem) === false) {
			overlap = newOverlap();

		} else if (filter(sliderItem) === false) {
			overlap = newOverlap();

		} else if (compare(baseItem, sliderItem)) {
			if (overlap.length === 0) {
				overlap.indexA = index;
				overlap.indexB = sliderIndex;
			}

			overlap.length += 1;

			if (overlap.length > overlapLongest.length) {
				overlapLongest = overlap;
			}

		} else {
			overlap = newOverlap();
		}

		const limit = overlapLongest.length - overlap.length + 1;

		if (index >= base.length - limit) { // Is last possible item in base
			if (index + sliderOffset === 0) { // Is first item in slider
				break;
			}

			slideForward();

		} else if (sliderIndex >= slider.length - limit) { // Is last possible item in slider
			slideForward();

		} else {
			index += 1;
		}
	}

	if (baseIsInputA === false) {
		const { indexA, indexB } = overlapLongest;
		overlapLongest.indexA = indexB;
		overlapLongest.indexB = indexA;
	}

	return overlapLongest;
}
