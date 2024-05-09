/**
 * Returns whether the given subject is between the given min and max
 */
export function isBetween(
	min: number,
	subject: number,
	max: number,
	options: {
		inclusive?: boolean;
	} = {}
) {
	const isInclusive = options.inclusive ?? false;
	if (isInclusive) {
		return (min <= subject && subject <= max);
	}
	return (min < subject && subject < max);
}
