/* eslint-disable @typescript-eslint/no-floating-promises */

/**
 * @template Value
 * @typedef {(value: Value) => void} Resolve
 */

/**
 * @typedef {(reason?: any) => void} Reject
 */

/**
 * @template Value
 * @typedef {Promise<Value> & {
 * isResolved: boolean;
 * reject: Reject;
 * resolve: Resolve<Value>;
 * }} PromiseDeferred
 */

/**
 * Returns a Promise with its resolve/reject methods exposed
 * @template Value
 * @returns {PromiseDeferred<Value>}
 */
export function defer() {
	let isResolved = false;
	/** @type {Resolve<Value>} */
	let resolve = () => {};
	/** @type {Reject} */
	let reject = () => {};

	const promise = new Promise((resolve_, reject_) => {
		resolve = resolve_;
		reject = reject_;
	});

	promise.finally(() => isResolved = true);

	Object.assign(promise, {
		reject,
		resolve,
	});

	Object.defineProperties(promise, {
		isResolved: {
			get: () => isResolved,
		},
	});

	return /** @type {PromiseDeferred<Value>} */(promise);
}
