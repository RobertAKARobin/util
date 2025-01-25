/**
 * Converts an array of values to an enum-like dict, where the index points to the value and vice-versa
 * @template {string} Value
 * @param {Array<Value>} input
 * @returns {Record<number, Value> & Record<Value, number>}
 */
export function arrayToEnum(input) {
	const output = /** @type {Record<number, Value> & Record<Value, number>} */ ({});
	input.forEach((value, index) => {
		/** @type {Record<Value, number>} */(output)[value] = index;
		/** @type {Record<number, Value>} */(output)[index] = value;
	});
	return output;
}
