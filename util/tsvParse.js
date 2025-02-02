/**
 * Converts a TSV string into an array of objects, using the given callback on each row
 * @template Entry
 * @param {string} input
 * @param {(input: Array<string>) => Entry} convert
 * @param {object} [options]
 * @param {string} [options.columnDelimiter='\t']
 * @param {string} [options.lineDelimiter='\t']
 * @returns {Array<Entry>}
 */
export function tsvParse(input, convert, options = {}) {
	const lineDelimiter = options.lineDelimiter ?? `\n`;
	const columnDelimiter = options.columnDelimiter ?? `\t`;

	const text = input.trim();
	if (text.length === 0) {
		return [];
	}

	const entries = [];

	for (const line of text.split(lineDelimiter)) {
		const columns = line.trimEnd().split(columnDelimiter);
		if (columns.length === 0) {
			continue;
		}

		const entry = convert(columns);
		entries.push(entry);
	}
	return entries;
}

