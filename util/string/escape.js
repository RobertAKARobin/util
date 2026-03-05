/**
 * Escape slashes and quotes and stuff in a string.
 * TODO3: Less-janky way.
 * @param {string} input
 * @returns {string}
 */
export function escape(input) {
	return JSON.stringify(input).replace(/^"|"$/g, ``);
}
