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
			action: ``,
			text: inputExpected,
		});
		return output;
	}

	const delimiter = options?.delimiter ?? `\n`;

	const deletions = inputExpected.split(delimiter);
	const additions = inputActual.split(delimiter);

	let editsMax = inputExpected.length + inputActual.length;
	let edits = 0;
	let chunks = /** @type {Array<DiffChunk>} */([]);
	let loops = 0;

	// down, diagonal, right

	// while (true) {
	// 	loops += 1;

	// 	if (indexActual >= actuals.length) {
	// 		indexExpected += 1;
	// 		indexActual = 0;
	// 	}

	// 	if (indexExpected >= expecteds.length) {
	// 		break;
	// 	}

	// 	// const expected = expecteds[indexExpected];
	// 	// const actual = actuals[indexActual];

	// 	// indexActual += 1;
	// }

	let steps = /** @type {Array<[DiffAction]>} */([]);
	let indexDeletion = -1;
	let indexAddition = -1;

	step(`.`);

	function step(
		/** @type {DiffAction} */direction,
	) {
		loops += 1;
		steps.push([direction]);

		if (direction === `-`) {
			indexDeletion += 1;
		} else if (direction === `+`) {
			indexAddition += 1;
		} else {
			indexDeletion += 1;
			indexAddition += 1;
		}

		if (indexDeletion < deletions.length) {
			step(`-`);
		}

		if (indexAddition < additions.length) {
			step(`+`);
		}

		if (indexDeletion < deletions.length && indexAddition < additions.length) {
			step(`.`);
		}

		if (indexDeletion === deletions.length && indexAddition === additions.length) {
			console.log(steps.slice(1).join(` `));
		}

		if (direction === `-`) {
			indexDeletion -= 1;
		} else if (direction === `+`) {
			indexAddition -= 1;
		} else {
			indexDeletion -= 1;
			indexAddition -= 1;
		}

		steps.pop();
	}

	console.log(loops);

	return output;
}
