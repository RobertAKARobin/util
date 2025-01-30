/**
 * Given the outer radius of a polygon return its inner radius, and vice-versa
 * @param {number} inputRadius
 * @param {number} sides
 * @param {'inner' | 'outer'} outputType
 * @returns {number}
 */
export function polygonRadius(
	inputRadius,
	sides,
	outputType,
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
