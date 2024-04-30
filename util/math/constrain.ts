/**
 * Given a number and a min and max value, returns the min if the number is smaller than the min, the max if larger than the max, the number otherwise.
 */
export function constrain(min: number, subject: number, max: number) {
	if (subject < min) { // Using if/else is much faster than Math.min/max when comparing just 2 numbers
		return min;
	}
	if (subject > max) {
		return max;
	}
	return subject;
}
