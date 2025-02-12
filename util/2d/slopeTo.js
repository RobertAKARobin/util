/**
 * @import { LineLike } from './types.d';
 */

// Separate from `slope.js` because it probably won't be used as often as `slope.js` and is a (slightly) nontrivial amount of code to import

import { getSlope } from './slope.js';
import { radiansTo } from './radians.js';

/**
 * Returns the slope of a line as degrees or radians
 * @param {LineLike} lineLike
 * @param {'degrees' | 'radians'} [unit=degrees]
 * @returns {number}
 */
export function slopeTo(
	lineLike,
	unit = `degrees`,
) {
	const slope = getSlope(lineLike);
	if (unit === `degrees`) {
		return slopeToDegrees(slope);
	}
	return slopeToRadians(slope);
}

/**
 * @param {number} slope
 * @ignore
 */
function slopeToDegrees(slope) {
	return radiansTo(slopeToRadians(slope));
}

const rightAngle = Math.PI / 2;

/**
 * @param {number} slope
 * @ignore
 */
function slopeToRadians(slope) {
	if (Object.is(slope, 0)) {
		return 0;
	}
	if (Object.is(slope, Infinity)) {
		return rightAngle;
	}
	if (Object.is(slope, -0)) {
		return rightAngle * 2;
	}
	if (Object.is(slope, -Infinity)) {
		return rightAngle * 3;
	}
	return Math.atan(slope);
}
