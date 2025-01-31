/**
 * Execute the given callback after the given delay
 * TODO1: Spec
 * @template Value
 * @param {() => Value} callback
 * @param {number} milliseconds
 * @returns {Promise<Value>}
 */
export function delay(callback, milliseconds) {
	return new Promise(resolve => {
		setTimeout(() => resolve(callback()), milliseconds);
	});
}
