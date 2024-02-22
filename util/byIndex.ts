export function byIndex<Type extends string>(...input: Array<Type>) {
	const out = {} as Record<Type, number>;
	for (let index = 0, length = input.length; index < length; index += 1) {
		out[input[index]] = index;
	}
	return out;
}
