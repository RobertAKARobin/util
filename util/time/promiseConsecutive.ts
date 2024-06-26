/**
 * Like Promise.all, except it runs the Promises in sequential order.
 * Each Promise is wrapped in a callback; otherwise they would all start at the same time.
 */
export async function promiseConsecutive<Value>(
	inputs: Array<(soFar: Array<Value>, index: number) => Promise<Value>>, // Using a spread ... seems to break the typing
): Promise<Array<Value>> {
	const out: Array<Value> = [];
	// TODO3: Use `for await..of` instead?
	await inputs.reduce(async(previous, input, index) => {
		await previous;
		out.push(await input(out, index));
	}, Promise.resolve());
	return out;
}
