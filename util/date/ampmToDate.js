/**
 * Convert a 12-hour string to a date
 * @overload
 * @param {string} input
 * @param {Date} [date]
 * @returns {Date}
 */
/**
 * @overload
 * @param {undefined} input
 * @param {Date} [date]
 * @returns {undefined}
 */
/**
 * @param {string | undefined} input
 * @param {Date} [date]
 * @returns {Date | undefined}
 */
export function ampmToDate(input, date = new Date()) {
	if (input === undefined) {
		return undefined;
	}

	const match = input.toLowerCase().match(/(\d{1,2}):(\d{1,2})\s*(am|pm)/);
	if (match === null) {
		return undefined;
	}

	const [
		_match,
		hoursString,
		minutesString,
		ampm,
	] = match;

	let hours = parseInt(hoursString);
	if (hours === 12) {
		hours = ampm === `am` ? 0 : 12;
	} else if (ampm === `pm`) {
		hours += 12;
	}

	const minutes = parseInt(minutesString);
	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		hours,
		minutes,
	);
};
