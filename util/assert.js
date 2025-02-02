export class AssertionError extends Error {
	/** @type {Array<unknown> | undefined} */
	values;

	/**
	 * @param {string} assertion
	 * @param {Array<unknown>} [values]
	 */
	constructor(assertion, values) {
		const message = assertion; // TODO2: Better assertion messages
		super(message);
		this.name = `AssertionError`;
		this.values = values;
	}
}

/**
 * @template Value
 * @typedef {(value: Value) => Value} ValueWrap
 */

/**
 * @param {boolean | ((condition: ValueWrap<unknown>) => boolean)} input
 * @returns {boolean}
 */
export function assert(input) {
	if (typeof input === `function`) {
		const values = /** @type {Array<unknown>} */([]);
		/**
		 * @template Value
		 * @param {Value} value
		 * @ignore
		 */
		const valueWrap = value => {
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
			throw new AssertionError(input.toString());
		}
	}

	return true;
}
