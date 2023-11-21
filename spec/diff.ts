import * as Diff from 'diff';

export const diff = (
	expected: string,
	actual: string,
): string => {
	const diff = Diff.diffLines(expected, actual);
	if (diff.length === 1) {
		return ``;
	}

	return diff.map(line => {
		const result = line.value;

		if (line.added === false && line.removed === false) {
			return result;
		}

		// Using cyan and magenta for added/removed so that it doesn't conflict with the typical passed/failed colors
		return line.added === true
			? `\x1b[45m${result}\x1b[0m`
			: line.removed === true
				? `\x1b[46m${result}\x1b[0m`
				: result;
	}).join(``);
};
