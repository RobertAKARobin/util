/**
 * Returns just the specified properties from the given target
 * @template Target
 * @template {keyof Target} Key
 * @param {Target} target
 * @param {Array<Key>} keys
 * @returns {Pick<Target, Key>}
 */
export function pick(target, ...keys) {
	const out = /** @type {Pick<Target, Key>} */({});
	for (const key of keys) {
		out[key] = target[key];
	}
	return out;
}
