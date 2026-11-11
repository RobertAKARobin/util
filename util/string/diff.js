/**
 * @typedef {{
 * action: `-` | `+` | ``;
 * text: string;
 * }} DiffChunk
 */

/**
 * @param {string} expected
 * @param {string} actual
 * @param {object} [options={}]
 * @returns {Array<DiffChunk>}
 */
export function diff(expected, actual, options) {
	const output = /** @type {Array<DiffChunk>} */([]);

	console.log(expected, actual, options);

	return output;
}
