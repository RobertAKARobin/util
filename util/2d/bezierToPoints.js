/**
 * @import { Coordinate } from '../types.d';
 */

import { preciseTo } from '../math/preciseTo';

import { bezierPoint } from './bezierPoint';

/**
 * Given the points of a Bezier curve, reduce it to a series of lines of length `progressPerLine`, and return the endpoints of those lines as a list
 * @param {Coordinate} begin
 * @param {Coordinate} beginHandle
 * @param {Coordinate} endHandle
 * @param {Coordinate} end
 * @param {number} progressPerLine
 * @returns {Array<Coordinate>}
 */
export function bezierToPoints(
	begin,
	beginHandle,
	endHandle,
	end,
	progressPerLine = .1,
) {
	const points = /** @type {Array<Coordinate>} */([]);

	let progress = 0;
	while (true) {
		if (progress > 1) {
			progress = 1;
		}

		const point = bezierPoint(
			begin,
			beginHandle,
			endHandle,
			end,
			progress,
		);
		points.push(point);

		if (progress === 1) {
			break;
		}

		progress = preciseTo(progress + progressPerLine);
	}

	return points;
}
