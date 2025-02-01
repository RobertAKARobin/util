/**
 * Converts object to FormData
 * TODO1: Spec
 * @param {Record<string, string>} input
 * @returns {FormData}
 */
export function toFormData(input) {
	const data = new FormData();
	for (const [key, value] of Object.entries(input)) {
		data.append(key, value);
	}
	return data;
}
