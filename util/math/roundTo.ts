/**
 * Round to the specified number. Default 0.00000000001
 */
const precision = Math.pow(10, 11);
export function roundTo(input: number, target = NaN) {
	let result = isNaN(target)
		? input
		: Math.round(input / target) * target;
	result = Math.round(result * precision) / precision;
	return result;
}
