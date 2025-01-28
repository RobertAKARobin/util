/**
 * Returns whether the given subject is between the given min and max
 * @param {number} min
 * @param {number} subject
 * @param {number} max
 * @param {object} [options]
 * @param {boolean} [options.inclusive=falase]
 * @returns {boolean}
 */
export function isBetween(
	min,
	subject,
	max,
	options = {},
) {
	const isInclusive = options.inclusive ?? false;
	if (isInclusive) {
		return (min <= subject && subject <= max);
	}
	return (min < subject && subject < max);
}
