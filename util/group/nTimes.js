/**
 * @typedef {Parameters<typeof Array.from>[1]} nTimesCallback
 */

/**
 * Perform the given operation n times and returns the result as an array
 * @template Value
 * @param {number} number
 * @param {Value | nTimesCallback} [contents]
 * @returns {Array<Value>}
 */
export function nTimes(number, contents = undefined) {
	if (contents === null || contents === undefined) {
		return /** @type {Array<Value>} */(Array.from(Array(number), (_nil, index) => index));
	}

	if (typeof contents === `function`) {
		return /** @type {Array<Value>} */(
			Array.from(Array(number), /** @type {nTimesCallback} */(contents))
		);
	}

	const result = /** @type {Array<Value>} */(Array(number).fill(contents));
	return result; // TODO3: Eslint complains that this returns `any[]` if it's one line
}
