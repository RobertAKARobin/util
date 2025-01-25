/**
 * Literally just `Object.keys`, but strongly typed.
 */
export function keysOf<
	Input extends Record<string | symbol, unknown>,
	Key extends keyof Input,
>(input: Input) {
	return Object.keys(input) as Array<Key>;
}
