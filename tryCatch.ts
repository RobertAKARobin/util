export function tryCatch<Result>(
	callback: () => (Result extends Promise<unknown> ? never : Result),
): Result | Error;
export function tryCatch<Result, DefaultIfError>(
	callback: () => (Result extends Promise<unknown> ? never : Result),
	defaultIfError: DefaultIfError,
): Result | DefaultIfError;
export function tryCatch<Result>(
	callback: () => Result,
): Result | Promise<Error>;
export function tryCatch<Result, DefaultIfError>(
	callback: () => Result,
	defaultIfError: DefaultIfError,
): Result | Promise<DefaultIfError>;
export function tryCatch<Result, DefaultIfError>(
	callback: () => Result,
	defaultIfError?: DefaultIfError
) {
	try {
		const result = callback();
		if (result instanceof Promise) {
			if (typeof defaultIfError === `undefined`) {
				return result.catch((error: Error) => error) as Result | Promise<Error>;
			}
			return result.catch(() => defaultIfError) as Result | Promise<DefaultIfError>;
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
