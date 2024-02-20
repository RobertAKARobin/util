export function updateQuerystring(updates: Record<string, string> | URLSearchParams) {
	const location = window.location;
	const params = new URLSearchParams(location.search);
	const entries = updates instanceof URLSearchParams
		? updates.entries()
		: Object.entries(updates);
	for (const [paramName, value] of entries) {
		params.set(paramName, value);
	}
	if (params.size === 0) {
		return;
	}
	const path = `${location.pathname}${location.hash}?${params}`;
	history.replaceState(null, ``, path);
}
