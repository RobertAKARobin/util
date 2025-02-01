/**
 * Sets a cookie, or if `options.value` is `null` then deletes it
 * TODO1: Spec
 * @param {object} options
 * @param {string} [options.domain]
 * @param {string} [options.expires]
 * @param {string} options.name
 * @param {string} [options.path]
 * @param {null | string} options.value - If null, deletes the cookie
 * @returns {void}
 */
export function cookie(options) {
	const action = options.value === null ? `delete` : `set`;
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
