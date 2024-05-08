export function preciseTo(input: number, places = 11) {
	const precision = Math.pow(10, places);
	return Math.round(input * precision) / precision;
}
