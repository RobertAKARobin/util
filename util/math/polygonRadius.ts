/**
 * Given the outer radius of a polygon return its inner radius, and vice-versa
 */
export function polygonRadius(
	inputRadius: number,
	sides: number,
	outputType: `inner` | `outer`,
) {
	if (sides === Infinity) {
		return inputRadius;
	}

	const innerAngle = (360 / sides) / 2;
	const factor = Math.cos(innerAngle / (180 / Math.PI));
	return outputType === `inner`
		? inputRadius * factor
		: inputRadius / factor;
}
