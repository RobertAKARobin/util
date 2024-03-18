type Resolve<Value> = (value: Value) => void;
type Reject = (reason?: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any


export function defer<Value>() {
	let resolve!: Resolve<Value>;
	let reject!: Reject;
	const promise = new Promise<Value>((resolve_, reject_) => {
		resolve = resolve_;
		reject = reject_;
	});
	// eslint-disable-next-line @typescript-eslint/no-floating-promises
	Object.assign(promise, {
		reject,
		resolve,
	});
	return promise as Promise<Value> & {
		reject: Reject;
		resolve: Resolve<Value>;
	};
}
