import type { Coordinate } from '../types.d.ts';

export function pointsAreDifferent(pointA: Coordinate, pointB: Coordinate) {
	return (pointA.x !== pointB?.x || pointA.y !== pointB?.y);
}
