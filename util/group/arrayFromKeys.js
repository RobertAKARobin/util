/**
 * Map each of the specified keys in an object to an array of values
 * @template Value
 * @param {Array<string>} keys
 * @param {Record<string, Value>} input
 * @param {object} [options={}]
 * @param {boolean} [options.assertAll=false] - If true, throws an error if not all of the object's keys are specified
 * @returns {Array<Value>}
 */
export function arrayFromKeys(
	keys,
	input,
	options = {},
) {
	const assertAll = options.assertAll ?? false;
	if (assertAll) {
		const delimeter = `;`;
		const inputKeys = Object.keys(input).sort().join(delimeter);
		const outputKeys = keys.sort().join(delimeter);
		if (inputKeys !== outputKeys) {
			throw new Error(`Not all keys are used:\nInput keys: ${inputKeys}\nOutput keys: ${outputKeys}`);
		}
	}

	return keys.map(key => {
		if (input[key] === undefined) {
			throw new Error(`'${key}' is not a valid key.`);
		} else {
			return input[key];
		}
	});
}
