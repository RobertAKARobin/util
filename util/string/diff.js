/**
 * @typedef {{
 * action: `-` | `+` | ``;
 * text: string;
 * }} DiffChunk
 */

/**
 * @param {string} inputExpected
 * @param {string} inputActual
 * @param {object} [options={}]
 * @param {string} [options.delimiter]
 * @returns {Array<DiffChunk>}
 */
export function diff(inputExpected, inputActual, options) {
	const output = /** @type {Array<DiffChunk>} */([]);

	if (inputExpected === inputActual) {
		output.push({
			action: ``,
			text: inputExpected,
		});
		return output;
	}

	const delimiter = options?.delimiter ?? `\n`;

	const expecteds = inputExpected.split(delimiter);
	const actuals = inputActual.split(delimiter);

	let changesMax = inputExpected.length + inputActual.length;
	let changes = 0;
	let chunks = /** @type {Array<DiffChunk>} */([]);
	let indexExpected = 0;
	let indexActual = 0;
	let loops = 0;

	while (true) {
		loops += 1;

		if (indexActual >= actuals.length) {
			indexExpected += 1;
			indexActual = 0;
		}

		if (indexExpected >= expecteds.length) {
			break;
		}

		const expected = expecteds[indexExpected];
		const actual = actuals[indexActual];
		console.log(loops, expected, actual);

		indexActual += 1;
	}

	return output;
}
