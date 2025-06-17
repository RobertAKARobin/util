/**
 * Execute the given callback or emit the given value after the given delay
 * TODO2: Spec
 * @template Value
 * @param {Value | (() => Value)} callback
 * @param {number} milliseconds
 * @returns {Promise<Value>}
 */
export function delay(callback, milliseconds) {
	return new Promise(resolve => {
		setTimeout(
			() => resolve(
				typeof callback === `function`
					? /** @type {() => Value} */(callback)()
					: callback,
			),
			milliseconds,
		);
	});
}
