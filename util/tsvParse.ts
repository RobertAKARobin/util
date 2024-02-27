export function tsvParse<Entry>(
	text: string,
	convert: (input: Array<string>) => Entry,
	options: Partial<{
		delimiter: string;
	}> = {},
) {
	const delimiter = options.delimiter ?? `\t`;

	const entries: Array<Entry> = [];
	for (const line of text.trim().split(`\n`)) {
		const columns = line.trimEnd().split(delimiter);
		if (columns.length === 0) {
			continue;
		}

		const entry: Entry = convert(columns);
		entries.push(entry);
	}
	return entries;
}
