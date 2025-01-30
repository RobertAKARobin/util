/**
 * Returns the given date and time in chunks, suitable for alphabetizing: `[YYYY, MM, DD, HH, mm, SS]`
 * @param {Date} date
 * @returns {Array<string>}
 */
export function dateAlphabetical(date) {
	return [
		String(date.getFullYear()),
		String(date.getMonth() + 1).padStart(2, `0`),
		String(date.getDate()).padStart(2, `0`),
		String(date.getHours()).padStart(2, `0`),
		String(date.getMinutes()).padStart(2, `0`),
		String(date.getSeconds()).padStart(2, `0`),
	];
}
