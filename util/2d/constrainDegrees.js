/**
 * Constrains the given number to between 0 and 360 degrees, e.g. -1 becomes 359 and 361 becomes 1
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
