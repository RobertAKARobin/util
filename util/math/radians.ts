import { roundTo } from './roundTo.ts';

export function radiansFrom(degrees: number, precision = 2) {
	return roundTo((degrees * Math.PI) / 180, precision);
}

export function radiansTo(radians: number, precision = 0) {
	return roundTo((180 * radians) / Math.PI, precision);
}
