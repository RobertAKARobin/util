export const precisionDefault = 11; // See https://stackoverflow.com/questions/1458633/how-can-i-deal-with-floating-point-number-precision-in-javascript. Some like 10, some like 12, so I split the difference

/**
 * Rounds the given number to the given number of decimal places
 * @param {number} input
 * @param {number} [places=11]
 * @returns {number}
 */
export function preciseTo(input, places = precisionDefault) {
	if (isNaN(places)) {
		return input;
	}

	const precision = Math.pow(10, places);
	return Math.round(input * precision) / precision;
}
