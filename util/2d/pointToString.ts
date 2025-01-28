import type { CoordinateLike } from '../types.d';
import { toCoordinate } from './toCoordinate';

export function pointToString(point: CoordinateLike) {
	const { x, y } = toCoordinate(point);
	return `${x},${y}`;
}
