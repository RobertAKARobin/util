import type { CoordinateLike } from '../types.d.ts';
import { getDistance } from './distance.ts';
import { toCoordinate } from './toCoordinate.ts';

export function pointsToAngles(
	...points: [CoordinateLike, CoordinateLike, CoordinateLike]
) {
	const [pointA, pointB, pointC] = points.map(toCoordinate);
	const sideAB = getDistance([pointA, pointB]);
	const sideAB2 = sideAB ** 2;
	const sideBC = getDistance([pointB, pointC]);
	const sideBC2 = sideBC ** 2;
	const sideAC = getDistance([pointA, pointC]);
	const sideAC2 = sideAC ** 2;

	const angles = [
		(sideAB2 + sideBC2 - sideAC2) / (2 * sideAB * sideBC),
		(sideBC2 + sideAC2 - sideAB2) / (2 * sideBC * sideAC),
		(sideAB2 + sideAC2 - sideBC2) / (2 * sideAB * sideAC),
	];
	return angles.map(Math.acos);
}
