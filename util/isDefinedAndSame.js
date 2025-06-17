/**
 * Whether the given parameters are exactly the same and also not `undefined`
 * TODO2: Spec
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
export function isDefinedAndSame(a, b) {
	return (
		(typeof a !== `undefined`)
		&& (typeof b !== `undefined`)
		&& a === b
	);
}
