export type AttributeValue = string | number | boolean | undefined | null | symbol | URL;

export function toAttributes(input: Record<string, AttributeValue>) {
	const out = [];
	for (const attributeName in input) {
		let value = input[attributeName];
		if (value === undefined || value === null || value === `undefined` || value === `null`) {
			continue;
		}
		if (typeof value !== `string`) {
			value = value.toString();
		}
		out.push(`${attributeName}="${value}"`);
	}
	return out.join(` `);
}
