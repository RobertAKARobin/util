export const toAttributes = (input: Record<string, string>) =>
	Object.entries(input)
		.map(([key, value]) => `${key}="${value}"`)
		.join(` `);
