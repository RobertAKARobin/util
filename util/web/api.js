/**
 * @template {Record<string, unknown>} Flags
 * @typedef {{
 * at: string;
 * body?: Record<string, boolean | number | string>;
 * flags?: Flags;
 * format?: keyof typeof contentTypes;
 * headers?: RequestInit['headers'];
 * method?: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
 * query?: Record<string, boolean | number | string>;
 * }} RequestOptions
 */

export const contentTypes = /** @type {const} */({
	json: `application/json`,
	plain: `text/plain`,
	urlencoded: `application/x-www-form-urlencoded`,
});

/**
 * Returns a wrapper around `fetch` that standardizes requests to a specific API
 * @template {Record<string, unknown>} Flags
 * @param {string} baseUrl
 * @param {object} [meta]
 * @param {Flags} [meta.flags] - Declare flags that can be passed into the request, which can be handled by `meta.preprocess`
 * @param {(parameters: RequestInit, options: RequestOptions<Flags>) => void} [meta.preprocess]
 * @returns {(options: RequestOptions<Flags>) => Promise<Response>}
 */
export function apiFactory(baseUrl, meta = {}) {
	/**
	 * A wrapper around `fetch` that handles things like parsing JSON, etc
	 * @template Response
	 * @param {RequestOptions<Flags>} options
	 * @returns {Promise<Response>}
	 */
	return async function request(options) {
		const parameters = /** @type {RequestInit} */({});

		let url = `${baseUrl}${options.at}`;
		if (options.query !== undefined) {
			const queryParams = new URLSearchParams(
				/** @type {Record<string, string>} */(options.query),
			);
			url += `?${queryParams}`;
		}

		parameters.method = options.method ?? (
			options.body === undefined ? `GET` : `POST`
		);

		const format = options.format ?? `plain`;

		parameters.headers = new Headers();
		parameters.headers.set(`Content-Type`, contentTypes[format]);

		if (options.body !== undefined) {
			if (format === `json`) {
				parameters.body = JSON.stringify(options.body);
			} else if (format === `urlencoded`) {
				parameters.body = new URLSearchParams(
					/** @type {Record<string, string>} */(options.body),
				);
			}
		}

		if (meta.preprocess) {
			meta.preprocess(parameters, {
				...options,
				flags: /** @type {Flags} */({
					...(meta.flags ?? {}),
					...(options.flags ?? {}),
				}),
			});
		}

		const request = fetch(url, parameters);
		const response = await request;
		return await /** @type {Response} */(response.json());
	};
}
