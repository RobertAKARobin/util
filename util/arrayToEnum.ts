export function arrayToEnum<Value extends string>(
	input: Array<Value>,
) {
	return input.reduce((output, value, index) => {
		(output as Record<Value, number>)[value] = index;
		(output as Record<number, Value>)[index] = value;
		return output;
	}, {} as Record<number, Value> & Record<Value, number>);
}
