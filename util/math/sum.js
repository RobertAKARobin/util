/**
 * Return the sum of the provided numbers
 * @param {Array<number>} inputs
 * @returns {number}
 */
export function getSum(...inputs) {
	return inputs.reduce((sum, input) => sum + input, 0);
}
