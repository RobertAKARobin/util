/**
 * Escape slashes and quotes and stuff in a string.
 * TODO3: Less-janky way.
 */
export function escape(input: string) {
	return JSON.stringify(input).replace(/^"|"$/g, ``);
}
