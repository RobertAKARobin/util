/**
 * Return the sum of the provided numbers
 */
export function getSum(...inputs: Array<number>) {
	return inputs.reduce((sum, input) => sum + input, 0);
}
