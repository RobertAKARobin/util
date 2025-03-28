/**
 * Split a string using a callback function
 * @param {string} subject
 * @param {(index: number) => void | [number, number]} callback - When you want to split off a new chunk, return `[delimiterStartIndex, delimiterLength]`
 * @returns {Array<string>}
 */
export function split(subject, callback) {
	const results = /** @type {Array<string>} */([]);

	const length = subject.length;
	let chunkStartIndex = 0;
	for (let index = 0; index < length; index += 1) {
		const delimiter = callback(index);

		if (delimiter === undefined) {
			continue;
		}

		const [delimiterStartIndex, delimiterLength] = delimiter;

		const chunk = subject.slice(chunkStartIndex, delimiterStartIndex);
		results.push(chunk);

		index = delimiterStartIndex + delimiterLength;
		chunkStartIndex = index;
	}

	if (chunkStartIndex < length) {
		const chunk = subject.slice(chunkStartIndex);
		results.push(chunk);
	}

	return results;
}
