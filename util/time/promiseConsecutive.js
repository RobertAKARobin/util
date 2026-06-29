/**
 * Like Promise.all, except it runs the Promises in sequential order.
 * Note that `[0, 0].map(() => myPromise())` will cause `myPromise` to start twice at the same time. To start them consecutively they should be wrapped in a callback, e.g. `[0, 0].map(() => () => myPromise())`
 * @template Value
 * @param {Array<Promise<Value> | ((index: number, outputs: Array<Value>) => Promise<Value>)>} inputs
 * @returns {Promise<Array<Value>>}
 */
export async function promiseConsecutive(inputs) {
	/** @type {Array<Value>} */
	const outputs = [];

	for (const [index, input] of inputs.entries()) {
		const output = input instanceof Promise
			? await input
			: await input(index, outputs); // TODO3: How to not need to specify type of `outputs` at call site?

		outputs.push(output);
	}

	return outputs;
}
