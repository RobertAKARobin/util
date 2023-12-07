import * as Diff from 'diff';

import { color } from '@util/colors.ts';

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
			? color(result, `grayLightBg`)
			: line.removed === true
				? color(result, `grayDarkBg`)
				: result;
	}).join(``);
};
