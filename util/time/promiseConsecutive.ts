/**
 * Like Promise.all, except it runs the Promises in sequential order.
 * Each Promise is wrapped in a callback; otherwise they would all start at the same time.
 */
export async function promiseConsecutive<Value>(
	inputs: Array<(soFar: Array<Value>, index: number) => Promise<Value>> // Using a spread ... seems to break the typing
): Promise<Array<Value>> {
	const out: Array<Value> = [];
	let index = 0;
	const length = inputs.length;
	// TODO3: Use `for await..of` instead?
	return new Promise(resolve => {
		const next = async() => {
			const result = await inputs[index](out, index);
			out.push(result);
			index += 1;
			if (index === length) {
				resolve(out);
			} else {
				void next();
			}
		};

		void next();
	});
}
