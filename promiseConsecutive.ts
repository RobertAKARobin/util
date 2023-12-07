export async function promiseConsecutive<Value>(
	inputs: Array<(soFar: Array<Value>, index: number) => Promise<Value>>
): Promise<Array<Value>> {
	const out: Array<Value> = [];
	// TODO3: Use `for await..of` instead?
	await inputs.reduce(async(previous, input, index) => {
		await previous;
		out.push(await input(out, index));
	}, Promise.resolve());
	return out;
}
