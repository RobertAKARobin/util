import { dateAlphabetical } from './dateAlphabetical';

/**
 * Returns the given date in chunks: `[YYYY, MM, DD]`
 * @param {Date} date
 * @returns {Array<string>}
 */
export function dateFormatYYYYMMDD(date) {
	return dateAlphabetical(date).slice(0, 3);
}
