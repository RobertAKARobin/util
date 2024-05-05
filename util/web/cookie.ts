/**
 * Sets or a cookie, or if the value is `_delete` then deletes it.
 */
export function cookie(options: {
	domain?: string;
	expires?: string;
	name: string;
	path?: string;
	value?: string;
}) {
	const action = options.value?.toLowerCase() === `_delete` ? `delete` : `set`;
	const expires = options.expires ?? (
		action === `delete` ? `Thu, 01 Jan 1970 00:00:01 GMT` : null
	);
	const value = options.value ?? ``;

	const chunks = [
		`${options.name}=${value}`,
		`Path=${options.path ?? `/`}`,
		`Domain=${options.domain ?? `.${location.host}`}`,
		...(expires === null ? [] : [
			`Expires=${expires}`,
		]),
	];
	document.cookie = chunks.join(`; `);
}
