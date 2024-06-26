export class AssertionError extends Error {
	values?: Array<unknown>;

	constructor(assertion: string, values?: Array<unknown>) {
		const message = assertion; // TODO2: Better assertion messages
		super(message);
		this.name = `AssertionError`;
		this.values = values;
	}
}

export function assert(value: boolean): boolean;
export function assert(
	condition: (
		valueWrap: <Value>(value: Value) => Value,
	) => boolean
): boolean;
export function assert(input: unknown): boolean {
	if (typeof input === `function`) {
		const values = [] as Array<unknown>;
		const valueWrap = <Value>(value: Value) => {
			values.push(value);
			return value;
		};
		if (input(valueWrap) !== true) { // If this errors, just throw the error, we don't need to wrap it in AssertionError
			throw new AssertionError(
				input.toString(),
				values,
			);
		}
	} else {
		if (input !== true) {
			throw new AssertionError(
				(input as string).toString(),
			);
		}
	}

	return true;
}
