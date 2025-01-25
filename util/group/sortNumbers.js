/**
 * Sort an array of number. JavaScript is stupid and when using regular `.sort()` converts all entries to strings first.
 * @param {Array<number>} inputs
 * @returns {Array<number>}
 */
export function sortNumbers(...inputs) {
	const numbers = inputs.map(Number);
	numbers.sort((a, b) => a - b);
	return numbers;
}
