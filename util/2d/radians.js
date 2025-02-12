import { constrainCircular } from '../math/constrain.js';

/**
 * Degrees to radians
 * @param {number} degrees
 * @returns {number}
 */
export function radiansFrom(degrees) {
	const angle = constrainCircular(degrees, 360);
	return (angle * Math.PI) / 180;
}

/**
 * Radians to degrees
 * @param {number} radians
 * @returns {number}
 */
export function radiansTo(radians) {
	const degrees = (180 * radians) / Math.PI;
	return constrainCircular(degrees, 360);
}
