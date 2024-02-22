export function isDefinedAndSame(a: unknown, b: unknown): boolean {
	return (
		(typeof a !== `undefined`)
		&& (typeof b !== `undefined`)
		&& a === b
	);
}
