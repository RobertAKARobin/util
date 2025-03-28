/**
 * Split a string using a callback function. This is useful when you want to split a string on a delimiter but include the delimiter in the resulting chunks.
 * @param {string} subject
 * @param {(index: number, subject: string) => void | number} callback - When you want to split off a new chunk, return `delimiterLength`, which is how many characters after `index` should be excluded before the next chunk begins
 * @returns {Array<string>}
 */
export function split(subject, callback) {
	const results = /** @type {Array<string>} */([]);

	const length = subject.length;
	let index = 0;
	let chunkStartIndex = 0;
	while (index < length) {
		const delimiterLength = callback(index, subject);

		if (delimiterLength === undefined) {
			index += 1;
			continue;
		}

		const chunk = subject.slice(chunkStartIndex, index);
		results.push(chunk);

		chunkStartIndex = index + delimiterLength;
		index += Math.max(1, delimiterLength);
	}

	if (chunkStartIndex <= length) {
		const chunk = subject.slice(chunkStartIndex);
		results.push(chunk);
	}

	return results;
}
