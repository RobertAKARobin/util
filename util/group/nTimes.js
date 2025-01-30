/**
 * Performs the given operation `n` times and returns the result as an array
 * @template Value
 * @overload
 * @param {number} number
 * @param {(nil: unknown, index: number) => Value} contents
 * @returns {Array<Value>}
 */

/**
 * @overload
 * @param {number} number
 * @param {undefined} [contents]
 * @returns {Array<number>}
 */

/**
 * @template Value
 * @overload
 * @param {number} number
 * @param {Value} contents
 * @returns {Array<Value>}
 */

/**
 * @template Value
 * @param {number} number
 * @param {(nil: unknown, index: number) => Value} [contents]
 * @returns {Array<Value> | Array<number>}
 */
export function nTimes(number, contents = undefined) {
	if (contents === null || contents === undefined) {
		return /** @type {Array<Value>} */(Array.from(Array(number), (_nil, index) => index));
	}

	if (typeof contents === `function`) {
		return /** @type {Array<Value>} */(Array.from(
			Array(number),
			/** @type {(nil: unknown, index: number) => Value} */(contents),
		));
	}

	const result = /** @type {Array<Value>} */(Array(number).fill(contents));
	return (result); // TODO3: Eslint complains that this returns `any[]` if it's one line
}
