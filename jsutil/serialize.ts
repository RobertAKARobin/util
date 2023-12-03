/**
 * Serialize an object as a native JS value so that it can be included in `[on*]` attributes. TODO2: Use JSON5 or something robust
 */
export function serialize(input: unknown): string { // eslint-disable-line @typescript-eslint/no-explicit-any
	if (input === null || input === undefined) {
		return ``;
	}
	if (Array.isArray(input)) {
		return `[${input.map(serialize).join(`,`)}]`;
	}
	if (typeof input === `function`) {
		return ``;
	}
	if (typeof input === `object`) {
		const toString = input.toString(); // eslint-disable-line @typescript-eslint/no-base-to-string
		if (toString === `[object Object]`) {
			let out = ``;
			for (const property in input) {
				const value = input[property as keyof typeof input] as Record<string, unknown>; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
				out += `${property.replaceAll(`"`, `&quot;`)}:${serialize(value)},`;
			}
			return `{${out}}`;
		}
		return serialize(toString);
	}
	if (typeof input === `string`) {
		const out = input
			.replaceAll(`"`, `&quot;`)
			.replaceAll(`'`, `\\'`);
		return `'${out}'`;
	}
	return input.toString(); // eslint-disable-line
}
