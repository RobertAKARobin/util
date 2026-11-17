/**
 * @typedef {`-` | `+` | `.`} DiffAction
 */

/**
 * @typedef {{
 * action: DiffAction;
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
			action: `.`,
			text: inputExpected,
		});
		return output;
	}

	const delimiter = options?.delimiter ?? `\n`;

	const deletions = inputExpected.split(delimiter);
	const additions = inputActual.split(delimiter);

	let editCountMax = inputExpected.length + inputActual.length;
	let sequences = (() => {
		let sequences = /** @type {Array<Array<DiffAction>>} */([]);

		let editCount = 0;
		let sequence = /** @type {Array<DiffAction>} */([]);
		let deletionsIndex = 0;
		let additionsIndex = 0;

		step(`-`);
		step(`+`);
		step(`.`);

		return sequences;

		function step(/** @type {DiffAction} */action) {
			if (editCount >= editCountMax) {
				return;
			}

			sequence.push(action);

			if (action === `-`) {
				editCount += 1;
				deletionsIndex += 1;
			} else if (action === `+`) {
				editCount += 1;
				additionsIndex += 1;
			} else {
				deletionsIndex += 1;
				additionsIndex += 1;
			}

			if (deletionsIndex < deletions.length) {
				step(`-`);
			}

			if (additionsIndex < additions.length) {
				step(`+`);
			}

			if (deletionsIndex < deletions.length && additionsIndex < additions.length) {
				step(`.`);
			}

			if (
				deletionsIndex === deletions.length
				&& additionsIndex === additions.length
			) {
				console.log(sequence.join(` `));
				if (editCount === editCountMax) {
					sequences.push([...sequence]);
				} else if (editCount < editCountMax) {
					editCountMax = editCount;
					sequences = [[...sequence]];
				}
			}

			if (action === `-`) {
				editCount -= 1;
				deletionsIndex -= 1;
			} else if (action === `+`) {
				editCount -= 1;
				additionsIndex -= 1;
			} else {
				deletionsIndex -= 1;
				additionsIndex -= 1;
			}

			sequence.pop();
		}
	})();

	console.log(sequences);

	return output;
}
