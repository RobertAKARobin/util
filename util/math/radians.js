export function constrainDegrees(degrees: number) {
	const remainder = degrees % 360;
	if (remainder < 0) {
		return 360 + remainder;
	}
	return remainder;
}

export function radiansFrom(degrees: number) {
	const angle = constrainDegrees(degrees);
	return (angle * Math.PI) / 180;
}

export function radiansTo(radians: number) {
	const degrees = (180 * radians) / Math.PI;
	return constrainDegrees(degrees);
}
