import type { CoordinateLike } from '../types.d.ts';
import { toCoordinate } from './toCoordinate.ts';

export function pointToString(point: CoordinateLike) {
	const { x, y } = toCoordinate(point);
	return `${x},${y}`;
}
