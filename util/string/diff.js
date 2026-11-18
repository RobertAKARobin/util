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

	const expecteds = inputExpected.split(delimiter);
	const expectedsLength = expecteds.length;
	const actuals = inputActual.split(delimiter);
	const actualsLength = actuals.length;

	let editCountMax = inputExpected.length + inputActual.length;
	const sequenceBest = (() => {
		let sequenceBest = /** @type {Array<DiffAction>} */([]);

		let editCount = 0;
		let sequence = /** @type {Array<DiffAction>} */([]);
		let chunks = /** @type {Array<string>} */([]);
		let expectedsIndex = 0;
		let actualsIndex = 0;

		step();

		return sequenceBest;

		function step(/** @type {DiffAction | undefined} */action = undefined) {
			if (editCount > editCountMax) {
				return;
			}

			if (action) {
				sequence.push(action);
			}

			if (action === `-`) {
				editCount += 1;
				expectedsIndex += 1;
			} else if (action === `+`) {
				chunks.push(actuals[actualsIndex]);
				editCount += 1;
				actualsIndex += 1;
			} else if (action === `.`) {
				chunks.push(expecteds[expectedsIndex]);
				expectedsIndex += 1;
				actualsIndex += 1;
			}

			if (actualsIndex < actualsLength) {
				step(`+`);
			}

			if (expectedsIndex < expectedsLength) {
				step(`-`);
			}

			if (expectedsIndex < expectedsLength && actualsIndex < actualsLength) {
				step(`.`);
			}

			if (
				expectedsIndex === expectedsLength
				&& actualsIndex === actualsLength
			) {
				const output = chunks.join(delimiter);

				if (output === inputActual) {
					editCountMax = editCount;
					sequenceBest = [...sequence];
				}
			}

			if (action === `-`) {
				editCount -= 1;
				expectedsIndex -= 1;
			} else if (action === `+`) {
				chunks.pop();
				editCount -= 1;
				actualsIndex -= 1;
			} else if (action === `.`) {
				chunks.pop();
				expectedsIndex -= 1;
				actualsIndex -= 1;
			}

			if (action) {
				sequence.pop();
			}
		}
	})();

	return sequenceBest;
}
