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
 * Given two arrays, find segments of those arrays that overlap
 * @template [Value=string]
 * @param {Array<Value>} inputA
 * @param {Array<Value>} inputB
 * @param {object} [options]
 * @param {typeof findOverlapDefaultCompare<Value>} [options.compare] - Function that tests whether two items in the arrays are the same
 * @param {typeof findOverlapDefaultFilter<Value>} [options.filter] - Function that tests whether an item can be considered for overlap
 * @param {'exhausted' | 'first' | 'maxLength'} [options.stopCondition='exhausted'] - Condition on which the function stops finding overlaps and returns the results
 * @returns {Overlap}
 */
export function findOverlap(inputA, inputB, options = {}) {
	if (inputA.length === 0 || inputB.length === 0) {
		return newOverlap();
	}

	const compare = options.compare ?? findOverlapDefaultCompare;
	const filter = options.filter ?? findOverlapDefaultFilter;
	const stopCondition = options.stopCondition ?? `exhausted`;

	const baseIsInputA = inputA.length > inputB.length;
	const [base, slider] = baseIsInputA ? [inputA, inputB] : [inputB, inputA]; // If slider length is always <= base length it simplifies stop conditions

	let baseIndex = 0;
	let sliderOffset = slider.length - 1;
	let overlap = newOverlap();
	let overlapLongest = overlap;
	let overlapLongestLength = 0;

	while (true) {
		const sliderIndex = baseIndex + sliderOffset;
		const baseItem = base[baseIndex];
		const sliderItem = slider[sliderIndex];

		const isMatch = (
			filter(baseItem)
			&& filter(sliderItem)
			&& compare(baseItem, sliderItem)
		);

		if (isMatch) {
			if (overlap.length === 0) {
				overlap.indexA = baseIndex;
				overlap.indexB = sliderIndex;
			}

			overlap.length += 1;

			if (overlap.length > overlapLongestLength) {
				overlapLongest = overlap;
				overlapLongestLength = overlap.length;
			}
		}

		let baseIndexMax = base.length - 1;
		let sliderIndexMax = slider.length - 1;

		if (stopCondition === `maxLength`) {
			const overlapShortness = (overlapLongestLength - overlap.length);
			baseIndexMax -= overlapShortness;
			sliderIndexMax -= overlapShortness;
		}

		const isBaseEnd = baseIndex >= baseIndexMax;
		const isSliderEnd = sliderIndex >= sliderIndexMax;

		if (isMatch === false || isSliderEnd || isBaseEnd) {
			overlap = newOverlap();
		}

		if (
			isBaseEnd
			&& sliderIndex <= (stopCondition === `maxLength` ? overlapLongestLength : 0)
		) {
			break;

		} else if (isSliderEnd || isBaseEnd) {
			sliderOffset -= 1;
			baseIndex = sliderOffset > 0 ? 0 : 0 - sliderOffset;

		} else {
			baseIndex += 1;
		}
	}

	if (baseIsInputA === false) {
		const { indexA, indexB } = overlapLongest;
		overlapLongest.indexA = indexB;
		overlapLongest.indexB = indexA;
	}

	return overlapLongest;
}
