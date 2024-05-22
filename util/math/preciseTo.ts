/**
 * Rounds the given number out to the given number of decimal places (default 11)
 */
export function preciseTo(input: number, places = 11) {
	if (isNaN(places)) {
		return input;
	}

	const precision = Math.pow(10, places);
	return Math.round(input * precision) / precision;
}
