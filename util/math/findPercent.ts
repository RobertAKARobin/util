import { preciseTo } from './preciseTo.ts';

/**
* Perform a binary search: evaluate the midpoint of a progressively smaller range of percents until the difference between the top and bottom results is 0, or the results stop changing.
* TODO3: Make the number of "segments" configurable?
 */
export function findPercent(
	evaluate: (percent: number) => number,
	options: {
		iterationCap?: number;
		precision?: number;
	} = {},
) {
	const iterationCap = options.iterationCap ?? 100;
	const precision = options.precision ?? 2;

	let boundBottom = 0;
	let boundTop = 1;
	let iterationCount = 0;
	let resultBottomLast = NaN;
	let resultMiddleLast = NaN;
	let resultTopLast = NaN;
	while (true) {
		iterationCount += 1;
		if (iterationCount >= iterationCap) {
			throw new RangeError();
		}

		const boundOffset = preciseTo((boundTop - boundBottom) / 2, precision);
		const boundMiddle = boundBottom + boundOffset;

		const resultBottom = preciseTo(evaluate(boundBottom), precision);
		const resultMiddle = preciseTo(evaluate(boundMiddle), precision);
		const resultTop = preciseTo(evaluate(boundTop), precision);

		if (
			(
				resultTop - resultMiddle === 0
				&& resultMiddle - resultBottom === 0
			)
			|| (
				resultBottom === resultBottomLast
				&& resultMiddle === resultMiddleLast
				&& resultTop === resultTopLast
			)
		) {
			return preciseTo(boundMiddle, 2);
		}

		resultBottomLast = resultBottom;
		resultMiddleLast = resultMiddle;
		resultTopLast = resultTop;

		const closest = Math.min(resultBottom, resultMiddle, resultTop);
		switch (closest) {
			case resultBottom: {
				boundTop -= boundOffset;
				break;
			}
			case resultMiddle: {
				boundTop -= (boundOffset / 2);
				boundBottom += (boundOffset / 2);
				break;
			}
			case resultTop: {
				boundBottom += boundOffset;
				break;
			}
		}
	}
}
