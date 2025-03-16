import { color } from '../node/colors.js';

/**
 * TODO1
 * @param {string} expected
 * @param {string} actual
 * @returns {string}
 */
export function diff(expected, actual) {
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
