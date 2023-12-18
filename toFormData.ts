export function toFormData(input: Record<string, string>) {
	const data = new FormData();
	for (const [key, value] of Object.entries(input)) {
		data.append(key, value);
	}
	return data;
}
