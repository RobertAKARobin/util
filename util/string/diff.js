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

	const deletions = inputExpected.split(delimiter);
	const additions = inputActual.split(delimiter);

	let editCountMax = inputExpected.length + inputActual.length;
	const sequenceBest = (() => {
		let sequenceBest = /** @type {Array<DiffAction>} */([]);

		let editCount = 0;
		let sequence = /** @type {Array<DiffAction>} */([]);
		let chunks = /** @type {Array<string>} */([]);
		let deletionsIndex = 0;
		let additionsIndex = 0;

		step(`-`);
		step(`+`);
		step(`.`);

		return sequenceBest;

		function step(/** @type {DiffAction} */action) {
			if (editCount >= editCountMax) {
				return;
			}

			sequence.push(action);

			if (action === `-`) {
				editCount += 1;
				deletionsIndex += 1;
			} else if (action === `+`) {
				chunks.push(additions[additionsIndex]);
				editCount += 1;
				additionsIndex += 1;
			} else {
				chunks.push(deletions[deletionsIndex]);
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
				const output = chunks.join(delimiter);

				if (output === inputActual) {
					editCountMax = editCount;
					sequenceBest = [...sequence];
				}
			}

			if (action === `-`) {
				editCount -= 1;
				deletionsIndex -= 1;
			} else if (action === `+`) {
				chunks.pop();
				editCount -= 1;
				additionsIndex -= 1;
			} else {
				chunks.pop();
				deletionsIndex -= 1;
				additionsIndex -= 1;
			}

			sequence.pop();
		}
	})();

	return sequenceBest;
}
