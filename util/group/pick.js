/**
 * Returns just the specified properties from the given target
 */
export function pick<Target, Key extends keyof Target>(
	target: Target,
	...keys: Array<Key>
): Pick<Target, Key> {
	const out = {} as Pick<Target, Key>;
	for (const key of keys) {
		out[key] = target[key];
	}
	return out;
}
