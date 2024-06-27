export function plural(input: string) { // Super naive pluralization
	if (input.endsWith(`s`) === false) {
		return `${input}s`;
	}
	return input;
}
