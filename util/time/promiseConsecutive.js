/**
 * Like Promise.all, except it runs the Promises in sequential order.
 * Each Promise is wrapped in a callback; otherwise they would all start at the same time.
 * TODO2: Spec
 * @template Value
 * @param {Array<(soFar: Array<Value>, index: number) => Promise<Value>>} inputs
 * @returns {Promise<Array<Value>>}
 */
export async function promiseConsecutive(inputs) {
	/** @type {Array<Value>} */
	const out = [];
	// TODO3: Use `for await..of` instead?
	await inputs.reduce(async(previous, input, index) => {
		await previous;
		out.push(await input(out, index));
	}, Promise.resolve());
	return out;
}
