/**
 * Get a date representing the last milisecond of the given day
 */
export function dayEnd(date: Date) {
	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate() + 1, // Go to tomorrow...
		0,
		0,
		0,
		-1, // ...minus one ms, i.e. the last ms of today
	);
}

/**
 * Get a date representing the first milisecond of the given day
 */
export function dayStart(date: Date) {
	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
	);
}
