/**
 * Sort an array of number. JavaScript is stupid and when using regular `.sort()` converts all entries to strings first.
 */
export function sortNumbers(...inputs: Array<number>) {
	const numbers = inputs.map(Number);
	numbers.sort((a, b) => a - b);
	return numbers;
}
