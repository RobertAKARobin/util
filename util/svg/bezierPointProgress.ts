import type { Coordinate } from 'util/types.d.ts';

/**
 * Given the points of a Bezier curve, and n% progress along the curve, calculate the coordinates of the point at that progress.
 * Progress is expressed as a percent, but n% progress is _not_ n% of the curve's length.
 */
export function bezierPointProgress(
	progress: number,
	begin: Coordinate,
	beginHandle: Coordinate,
	endHandle: Coordinate,
	end: Coordinate,
): Coordinate {
	const out: Coordinate = { x: 0, y: 0 };
	for (const key in out) {
		const axis = key as keyof Coordinate;
		const remainder = 1 - progress;
		out[axis] = (
			(begin[axis] * Math.pow(remainder, 3) * Math.pow(progress, 0))
			+ (beginHandle[axis] * Math.pow(remainder, 2) * Math.pow(progress, 1) * 3)
			+ (endHandle[axis] * Math.pow(remainder, 1) * Math.pow(progress, 2) * 3)
			+ (end[axis] * Math.pow(remainder, 0) * Math.pow(progress, 3))
		);
	}
	return out;
}
