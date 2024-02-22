export function indexOn<Type extends object>(inputs: Iterable<Type>, key: keyof Type) {
	const out = {} as Record<string, Type>;
	for (const input of inputs) {
		if (!(key in input)) {
			throw new Error(`Property '${key.toString()}' missing`);
		}

		const value = input[key] as string;
		out[value] = input;
	}
	return out;
}
