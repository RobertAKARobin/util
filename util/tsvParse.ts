export function tsvParse<Entry>(
	input: string,
	convert: (input: Array<string>) => Entry,
	options: Partial<{
		delimiter: string;
	}> = {},
) {
	const delimiter = options.delimiter ?? `\t`;

	const text = input.trim();
	if (text.length === 0) {
		return [];
	}

	const entries: Array<Entry> = [];

	for (const line of text.split(`\n`)) {
		const columns = line.trimEnd().split(delimiter);
		if (columns.length === 0) {
			continue;
		}

		const entry: Entry = convert(columns);
		entries.push(entry);
	}
	return entries;
}
