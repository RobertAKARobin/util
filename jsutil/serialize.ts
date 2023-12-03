/**
 * Serialize an object as a native JS value so that it can be included in `[on*]` attributes. TODO2: Use JSON5 or something robust
 */
export function serialize(input: unknown): string {
	let skipCount = 0;
	const result = iterate(input);
	if (skipCount > 0) {
		console.warn(`Found ${skipCount} objects that couldn't be serialized.`);
	}
	return result;

	function iterate(input: unknown): string { // eslint-disable-line @typescript-eslint/no-explicit-any
		if (input === null || input === undefined) {
			return ``;
		}
		if (Array.isArray(input)) {
			return `[${input.map(iterate).join(`,`)}]`;
		}
		if (typeof input === `function`) {
			skipCount += 1;
			return ``;
		}
		if (typeof input === `object`) {
			const toString = input.toString(); // eslint-disable-line @typescript-eslint/no-base-to-string
			if (toString === `[object Object]`) {
				let out = ``;
				for (const property in input) {
					const value = input[property as keyof typeof input] as Record<string, unknown>; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
					out += `${property.replaceAll(`"`, `&quot;`)}:${iterate(value)},`;
				}
				return `{${out}}`;
			}
			return iterate(toString);
		}
		if (typeof input === `string`) {
			const out = input
				.replaceAll(`"`, `&quot;`)
				.replaceAll(`'`, `\\'`);
			return `'${out}'`;
		}
		return input.toString(); // eslint-disable-line
	}
}
