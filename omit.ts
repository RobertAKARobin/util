export function omit<Source, Keys extends Array<keyof Source>>(
	source: Source,
	...keys: Keys
) {
	const output = { ...source };
	for (const key of keys) {
		delete output[key];
	}
	return output as Omit<Source, Keys[number]>;
}
