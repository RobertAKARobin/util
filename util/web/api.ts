export const contentTypes = {
	json: `application/json`,
	plain: `text/plain`,
	urlencoded: `application/x-www-form-urlencoded`,
} as const;

export type RequestOptions<
	Flags extends Record<string, unknown> = Record<string, never>,
> = {
	at: string;
	body?: Record<string, boolean | number | string>;
	flags?: Flags;
	format?: keyof typeof contentTypes;
	headers?: RequestInit[`headers`];
	method?: `DELETE` | `GET` | `PATCH` | `POST` | `PUT`;
	query?: Record<string, boolean | number | string>;
};

export function apiFactory<
	Flags extends Record<string, unknown> = Record<string, never>,
>(
	baseUrl: string,
	meta: {
		flags?: Flags;
		preprocess?: (
			parameters: RequestInit,
			options: RequestOptions<Flags>
		) => void;
	} = {}
) {
	return async function request<Response>(
		options: RequestOptions<Flags>
	) {
		const parameters = {} as RequestInit;

		let url = `${baseUrl}${options.at}`;
		if (options.query !== undefined) {
			const queryParams = new URLSearchParams(options.query as Record<string, string>);
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
				parameters.body = new URLSearchParams(options.body as Record<string, string>);
			}
		}

		if (meta.preprocess) {
			meta.preprocess(parameters, {
				...options,
				flags: {
					...(meta.flags ?? {}),
					...(options.flags ?? {}),
				} as Flags,
			});
		}

		const request = fetch(url, parameters);
		const response = await request;
		return await response.json() as Response;
	};
}
