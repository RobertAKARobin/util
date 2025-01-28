/**
 * Constrains the given number to between 0 and 360 degrees, e.g. -1 becomes 359 and 361 becomes 1
 * TODO1: Move to own file
 * @param {number} degrees
 * @returns {number}
 */
export function constrainDegrees(degrees) {
	const remainder = degrees % 360;
	if (remainder < 0) {
		return 360 + remainder;
	}
	return remainder;
}

/**
 * Degrees to radians
 * @param {number} degrees
 * @returns {number}
 */
export function radiansFrom(degrees) {
	const angle = constrainDegrees(degrees);
	return (angle * Math.PI) / 180;
}

/**
 * Radians to degrees
 * @param {number} radians
 * @returns {number}
 */
export function radiansTo(radians) {
	const degrees = (180 * radians) / Math.PI;
	return constrainDegrees(degrees);
}
