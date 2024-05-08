import { preciseTo } from './preciseTo.ts';

/**
 * Perform a binary search: evaluate the midpoint of a progressively smaller range of percents until the top and bottom results are identical, or either is 0.
 */
export function findPercent(
	evaluate: (percent: number) => number,
	options: {
		iterationCap?: number;
		precision?: number;
	} = {}
) {
	const iterationCap = options.iterationCap ?? 1000;
	const precision = options.precision ?? 2;

	let boundBottom = 0;
	let boundTop = 1;
	let iterationCount = 0;
	while (true) {
		iterationCount += 1;
		if (iterationCount >= iterationCap) {
			throw new RangeError();
		}

		const boundOffset = preciseTo((boundTop - boundBottom) / 2, precision);

		const resultBottom = preciseTo(evaluate(boundBottom), precision);
		const resultTop = preciseTo(evaluate(boundTop), precision);

		if (resultBottom === 0) {
			return boundBottom;
		} else if (resultTop === 0) {
			return boundTop;
		} else if (resultBottom === resultTop) {
			return boundBottom + boundOffset;
		}

		if (resultBottom < resultTop) {
			boundTop -= boundOffset;
		} else if (resultBottom > resultTop) {
			boundBottom += boundOffset;
		}
	}
}
