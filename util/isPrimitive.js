/**
 * Whether the given input is a primitive data type
 * TODO1: Spec
 * @param {unknown} input
 * @returns {boolean}
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Primitive
 */
export function isPrimitive(input) {
	return typeof input === `object`
		? false
		: typeof input === `function`
			?	false
			: true;
}
