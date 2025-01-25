/**
 * Map each of the specified keys in an object to an array of values
 * @param _options.assertAll - If true, throws an error if not all of the object's keys are specified
 */
export function arrayFromKeys<Value>(
	keys: Array<string>,
	input: Record<string, Value>,
	options: {
		assertAll?: boolean;
	} = {},
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
