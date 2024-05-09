import { getSlope } from './slope.ts';
import type { LineLike } from '../types.d.ts';
import { radiansTo } from './radians.ts';

export function slopeTo(
	lineLike: LineLike,
	unit: `degrees` | `radians` = `degrees`
) {
	const slope = getSlope(lineLike);
	if (unit === `degrees`) {
		return slopeToDegrees(slope);
	}
	return slopeToRadians(slope);
}

export function slopeToDegrees(slope: number) {
	return radiansTo(slopeToRadians(slope));
}

const rightAngle = Math.PI / 2;

export function slopeToRadians(slope: number) {
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
