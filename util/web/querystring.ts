/**
 * Sets the given querystring with the given updates, then returns the string
 */
export function updateQuerystring(
	input: Location | URL | string,
	updates: Record<string, string> | URLSearchParams
) {
	const location = input instanceof URL
		? input
		: typeof input === `string`
			? new URL(input)
			: new URL(input.href);

	const params = new URLSearchParams(location.search);

	let output = `${location.origin}${location.pathname}`;

	const entries = updates instanceof URLSearchParams
		? updates.entries()
		: Object.entries(updates);

	for (const [paramName, value] of entries) {
		params.set(paramName, value);
	}

	if (params.size > 0) {
		output += `?${params}`;
	}

	output += location.hash;

	return output;
}
