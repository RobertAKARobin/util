/**
 * Just forces JSDOC to recognize that a value is not null, rather than needing to type out the whole value.
 * {@link https://github.com/microsoft/TypeScript/issues/23405}
 * TODO2: Spec
 * @template Input
 * @param {Input} input
 * @returns {NonNullable<Input>}
 */
export function isNotNull(input) {
	return /** @type {NonNullable<Input>} */(input);
}
