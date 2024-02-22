export function plural(input: string) { // Super naive pluralization
	if (!input.endsWith(`s`)) {
		return `${input}s`;
	}
	return input;
}
