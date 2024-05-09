type nTimesCallback<Value> = (
	nil: undefined,
	index: number,
) => Value;

/**
 * Perform the given operation n times and returns the result as an array
 */
export function nTimes<Value = number>(
	number: number,
	contents?:
		| nTimesCallback<Value>
		| Value,
): Array<Value> {
	if (contents === null || contents === undefined) {
		return Array.from(Array(number), (_nil, index) => index) as Array<Value>;
	}
	if (typeof contents === `function`) {
		return Array.from(Array(number), contents as nTimesCallback<Value>);
	}
	return Array(number).fill(contents) as Array<Value>;
}
