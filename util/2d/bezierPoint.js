/**
 * @import { Coordinate } from '../types.d';
 */

import { keysOf } from '../group/keysOf';
import { preciseTo } from '../math/preciseTo';

/**
 * Given the points of a Bezier curve, and n% progress along the curve, calculate the coordinates of the point at that progress.
 * Progress is expressed as a percent, but n% progress is _not_ n% of the curve's length.
 * @param {Coordinate} begin
 * @param {Coordinate} beginHandle
 * @param {Coordinate} endHandle
 * @param {Coordinate} end
 * @param {number} progress
 * @returns {Coordinate}
 */
export function bezierPoint(
	begin,
	beginHandle,
	endHandle,
	end,
	progress,
) {
	const out = { x: 0, y: 0 };
	for (const key of keysOf(out)) {
		const axis = key;
		const remainder = 1 - progress;
		const result = (
			(begin[axis] * Math.pow(remainder, 3) * Math.pow(progress, 0))
			+ (beginHandle[axis] * Math.pow(remainder, 2) * Math.pow(progress, 1) * 3)
			+ (endHandle[axis] * Math.pow(remainder, 1) * Math.pow(progress, 2) * 3)
			+ (end[axis] * Math.pow(remainder, 0) * Math.pow(progress, 3))
		);
		out[axis] = preciseTo(result);
	}
	return out;
}
