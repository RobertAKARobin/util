/**
 * @typedef {`-` | `+` | `.`} DiffAction
 */

/**
 * @param {string} aaInput
 * @param {string} bbInput
 * @param {object} [options={}]
 * @param {string} [options.delimiter]
 * @returns {Array<DiffAction>}
 */
export function diff(aaInput, bbInput, options) {
	const delimiter = options?.delimiter ?? `\n`;

	const aaChunks = aaInput === `` ? [] : aaInput.split(delimiter);
	const aaLength = aaChunks.length;
	const bbChunks = bbInput === `` ? [] : bbInput.split(delimiter);
	const bbLength = bbChunks.length;

	if (aaInput === bbInput) {
		return /** @type {Array<DiffAction>} */(Array(aaLength)).fill(`.`);
	}

	if (aaLength === 0 && bbLength !== 0) {
		return /** @type {Array<DiffAction>} */(Array(bbLength)).fill(`+`);
	}

	if (aaLength !== 0 && bbLength === 0) {
		return /** @type {Array<DiffAction>} */(Array(aaLength)).fill(`-`);
	}

	let editCountMax = aaLength + bbLength;

	const sequences = (() => {
		let sequences = /** @type {Array<Array<DiffAction>>} */([]);

		let editCount = 0;
		let sequence = /** @type {Array<DiffAction>} */([]);
		let chunks = /** @type {Array<string>} */([]);
		let aaIndex = 0;
		let bbIndex = 0;

		step();

		return sequences;

		function step() {
			if (editCount > editCountMax) {
				return;
			}

			if (
				aaIndex === aaLength
				&& bbIndex === bbLength
			) {
				if (editCount === editCountMax) {
					sequences.push([...sequence]);
				} else {
					editCountMax = editCount;
					sequences = [[...sequence]];
				}

				return;
			}

			if (bbIndex < bbLength) {
				const chunk = bbChunks[bbIndex];
				if (chunk !== bbChunks[chunks.length]) {
					return;
				}

				sequence.push(`+`);
				chunks.push(chunk);
				editCount += 1;
				bbIndex += 1;

				step();

				sequence.pop();
				chunks.pop();
				editCount -= 1;
				bbIndex -= 1;
			}

			if (aaIndex < aaLength) {
				sequence.push(`-`);
				editCount += 1;
				aaIndex += 1;

				step();

				sequence.pop();
				editCount -= 1;
				aaIndex -= 1;
			}

			if (aaIndex < aaLength && bbIndex < bbLength) {
				const chunk = aaChunks[aaIndex];
				if (chunk !== bbChunks[chunks.length]) {
					return;
				}

				sequence.push(`.`);
				chunks.push(chunk);
				aaIndex += 1;
				bbIndex += 1;

				step();

				sequence.pop();
				chunks.pop();
				aaIndex -= 1;
				bbIndex -= 1;
			}
		}
	})();

	return sequences[sequences.length - 1];
}
