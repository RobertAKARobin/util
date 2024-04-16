/**
 * Convert a 12-hour string to a date
 */
export function ampmToDate(input: string, date?: Date): Date;
export function ampmToDate(input: undefined, date?: Date): undefined;
export function ampmToDate(input: string | undefined, date?: Date): Date | undefined;
export function ampmToDate(
	input: string | undefined,
	date: Date = new Date()
) {
	if (input === undefined) {
		return undefined;
	}

	const [
		_match,
		hoursString,
		minutesString,
		ampm,
	] = input.toLowerCase().match(/(\d{1,2}):(\d{1,2})\s*(am|pm)/)!;

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
