/**
 * Serialize an object as a native JS value, e.g. so that it can be included in `[on*]` attributes. TODO3: Use JSON5 or something robust
 */
export function serialize(input: unknown): string {
	let skipCount = 0;
	const result = iterate(input);
	if (skipCount > 0) {
		console.warn(`Found ${skipCount} objects that couldn't be serialized.`);
	}
	return result;

	function iterate(input: unknown): string { // eslint-disable-line @typescript-eslint/no-explicit-any
		if (input === undefined) {
			return ``;
		}
		if (input === null) {
			return `null`;
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
				const inputObject = input as Record<string, unknown>;
				const propertyNames = Object.keys(inputObject);
				const lastPropertyName = propertyNames[propertyNames.length - 1]; // Properties in JS dicts don't _have_ to be ordered, but always are
				for (const key of propertyNames) {
					const value = inputObject[key];
					if (value === undefined) {
						continue;
					}
					let propertyName = key;
					if (/^[a-zA-Z\$_]\w*$/.test(propertyName) === false) {
						propertyName = `'${propertyName}'`;
						propertyName = propertyName.replaceAll(`"`, `&quot;`);
					}
					out += `${propertyName}:${iterate(value)}`;
					if (key !== lastPropertyName) {
						out += `,`;
					}
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
