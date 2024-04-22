/* eslint-disable @typescript-eslint/no-floating-promises */
type Resolve<Value> = (value: Value) => void;
type Reject = (reason?: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Returns a Promise with its resolve/reject methods exposed
 */
export function defer<Value>() {
	let isResolved = false;
	let resolve!: Resolve<Value>;
	let reject!: Reject;
	const promise = new Promise<Value>((resolve_, reject_) => {
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

	return promise as Promise<Value> & {
		isResolved: boolean;
		reject: Reject;
		resolve: Resolve<Value>;
	};
}
