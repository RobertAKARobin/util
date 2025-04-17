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
 * Given two arrays, find segments of those arrays that overlap.
 * @template [Value=string]
 * @param {Array<Value>} inputA
 * @param {Array<Value>} inputB
 * @param {object} [options]
 * @param {typeof findOverlapDefaultCompare<Value>} [options.compare] - Function that tests whether two items in the arrays are the same
 * @param {typeof findOverlapDefaultFilter<Value>} [options.filter] - Function that tests whether an item can be considered for overlap
 * @param {'first' | 'last' | 'maxLength'} [options.stopCondition='exhausted'] - Condition on which the function stops finding overlaps and returns the results
 * @returns {Array<Overlap>}
 */
export function findOverlaps(inputA, inputB, options = {}) {
	if (inputA.length === 0 || inputB.length === 0) {
		return [newOverlap()];
	}

	const compare = options.compare ?? findOverlapDefaultCompare;
	const filter = options.filter ?? findOverlapDefaultFilter;
	const stopCondition = options.stopCondition ?? `last`;

	const overlaps = /** @type {Array<Overlap>} */([]);

	const baseIsInputA = inputA.length > inputB.length;
	const [base, slider] = baseIsInputA ? [inputA, inputB] : [inputB, inputA]; // If slider length is always <= base length it simplifies stop conditions

	let baseIndex = 0;
	let sliderOffset = slider.length - 1;
	let overlap = newOverlap();
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
			if (overlap.length > 0) {
				overlaps.push(overlap);

				if (stopCondition === `first`) {
					break;
				}

				overlap = newOverlap();
			}
		}

		if (
			isBaseEnd
			&& sliderIndex <= (
				stopCondition === `maxLength` ? overlapLongestLength : 0
			)
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
		for (const overlap of overlaps) {
			const { indexA, indexB } = overlap;
			overlap.indexA = indexB;
			overlap.indexB = indexA;
		}
	}

	return overlaps;
}

/**
 * Given two arrays, find the segment of those arrays that overlaps and matches the options.stopCondition
 * @template [Value=string]
 * @param {Array<Value>} inputA
 * @param {Array<Value>} inputB
 * @param {Parameters<typeof findOverlaps<Value>>[2]} options
 * @returns {Overlap}
 */
export function findOverlap(inputA, inputB, options = {}) {
	const stopCondition = options.stopCondition ?? `maxLength`;

	const overlaps = findOverlaps(inputA, inputB, {
		...options,
		stopCondition,
	});

	if (overlaps.length === 0) {
		return newOverlap();
	}

	switch (stopCondition) {
		case `maxLength`: {
			overlaps.sort((a, b) => {
				if (a.length > b.length) {
					return 1;
				}

				if (
					a.length === b.length
					&& a.indexA + a.indexB < b.indexA + b.indexB
				) {
					return 1;
				}

				return -1;
			});
			return overlaps[overlaps.length - 1];
		}

		case `last`: {
			return overlaps[overlaps.length - 1];
		}

		default: {
			return overlaps[0];
		}
	}
}
