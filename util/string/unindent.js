const matcher = /^[\s\t]*/gm;

/**
 * Returns the given string without the leading spaces and tabs from each line
 * @param {string} input
 * @returns {string}
 */
export function unindent(input) {
	return input.replaceAll(matcher, ``);
}
