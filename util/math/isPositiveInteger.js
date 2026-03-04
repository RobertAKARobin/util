/**
 * Returns whether the input is an integer greater than 0.
 * @param {number} input
 * @returns {boolean}
 */
export function isPositiveInteger(input) {
	return (Number.isSafeInteger(input) && input > 0);
}
