/**
 * @typedef {`-` | `+` | `.`} DiffAction
 */

/**
 * @param {string} inputExpected
 * @param {string} inputActual
 * @param {object} [options={}]
 * @param {string} [options.delimiter]
 * @returns {Array<DiffAction>}
 */
export function diff(inputExpected, inputActual, options) {
	const delimiter = options?.delimiter ?? `\n`;

	const expecteds = inputExpected === `` ? [] : inputExpected.split(delimiter);
	const actuals = inputActual === `` ? [] : inputActual.split(delimiter);

	if (inputExpected === inputActual) {
		return /** @type {Array<DiffAction>} */(Array(expecteds.length)).fill(`.`);
	}

	if (inputExpected.length === 0 && inputActual.length !== 0) {
		return /** @type {Array<DiffAction>} */(Array(actuals.length)).fill(`+`);
	}

	if (inputExpected.length !== 0 && inputActual.length === 0) {
		return /** @type {Array<DiffAction>} */(Array(expecteds.length)).fill(`-`);
	}

	const expectedsLength = expecteds.length;
	const actualsLength = actuals.length;

	let editCountMax = inputExpected.length + inputActual.length;
	const sequences = (() => {
		let sequences = /** @type {Array<Array<DiffAction>>} */([]);

		let editCount = 0;
		let sequence = /** @type {Array<DiffAction>} */([]);
		let chunks = /** @type {Array<string>} */([]);
		let expectedsIndex = 0;
		let actualsIndex = 0;

		step();

		return sequences;

		function step() {
			if (editCount > editCountMax) {
				return;
			}

			if (
				expectedsIndex === expectedsLength
				&& actualsIndex === actualsLength
			) {
				if (editCount === editCountMax) {
					sequences.push([...sequence]);
				} else {
					editCountMax = editCount;
					sequences = [[...sequence]];
				}
			}

			if (actualsIndex < actualsLength) {
				const chunk = actuals[actualsIndex];
				if (chunk !== actuals[chunks.length]) {
					return;
				}

				sequence.push(`+`);
				chunks.push(chunk);
				editCount += 1;
				actualsIndex += 1;

				step();

				sequence.pop();
				chunks.pop();
				editCount -= 1;
				actualsIndex -= 1;
			}

			if (expectedsIndex < expectedsLength) {
				sequence.push(`-`);
				editCount += 1;
				expectedsIndex += 1;

				step();

				sequence.pop();
				editCount -= 1;
				expectedsIndex -= 1;
			}

			if (expectedsIndex < expectedsLength && actualsIndex < actualsLength) {
				const chunk = expecteds[expectedsIndex];
				if (chunk !== actuals[chunks.length]) {
					return;
				}

				sequence.push(`.`);
				chunks.push(chunk);
				expectedsIndex += 1;
				actualsIndex += 1;

				step();

				sequence.pop();
				chunks.pop();
				expectedsIndex -= 1;
				actualsIndex -= 1;
			}
		}
	})();

	return sequences[sequences.length - 1];
}
