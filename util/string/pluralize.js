/**
 * Super naive pluralization
 * @param {string} input
 * @returns {string}
 */
export function plural(input) {
	if (input.endsWith(`s`) === false) {
		return `${input}s`;
	}
	return input;
}
