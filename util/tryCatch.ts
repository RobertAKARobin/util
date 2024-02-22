export function tryCatch<Result>(
	callback: () => (Result extends Promise<unknown> ? never : Result),
): Error | Result;
export function tryCatch<Result, DefaultIfError>(
	callback: () => (Result extends Promise<unknown> ? never : Result),
	defaultIfError: DefaultIfError,
): DefaultIfError | Result;
export function tryCatch<Result>(
	callback: () => Result,
): Promise<Error> | Result;
export function tryCatch<Result, DefaultIfError>(
	callback: () => Result,
	defaultIfError: DefaultIfError,
): Promise<DefaultIfError> | Result;
export function tryCatch<Result, DefaultIfError>(
	callback: () => Result,
	defaultIfError?: DefaultIfError
) {
	try {
		const result = callback();
		if (result instanceof Promise) {
			if (typeof defaultIfError === `undefined`) {
				return result.catch((error: Error) => error) as Promise<Error> | Result;
			}
			return result.catch(() => defaultIfError) as Promise<DefaultIfError> | Result;
		} else {
			return result;
		}
	} catch (error: unknown) {
		if (typeof defaultIfError === `undefined`) {
			return error as Error;
		}
		return defaultIfError;
	}
}
