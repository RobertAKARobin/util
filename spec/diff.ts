import * as Diff from 'diff';

function toColors<ColorMap extends Record<string, number>>(
	input: ColorMap
) {
	const out = {} as Record<keyof ColorMap, string>;
	for (const key in input) {
		out[key as keyof ColorMap] = `\x1b[${input[key]}m`;
	}
	return out;
}

const c = toColors({
	bgBlue: 44,
	bgBlueLight: 104,
	bgCyan: 46,
	bgCyanLight: 106,
	bgGrayDark: 100,
	bgGrayLight: 47,
	bgGreen: 42,
	bgGreenLight: 102,
	bgMagenta: 45,
	bgMagentaLight: 105,
	bgRed: 41,
	bgRedLight: 101,
	dim: 2,
	fgBlack: 30,
	fgWhite: 97,
	reset: 0,
});

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

		// Not using green/red for added/removed so that it doesn't conflict with the typical passed/failed colors
		return line.added === true
			? `${c.bgGrayLight}${result}${c.reset}`
			: line.removed === true
				? `${c.bgGrayDark}${result}${c.reset}`
				: result;
	}).join(``);
};
