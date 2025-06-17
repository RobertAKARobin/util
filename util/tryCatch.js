/**
 * @import { IsAsync, IsAsync_Not } from './types.d';
 */

/**
 * Wraps around `try/catch`. Return the expected value, or an Error if it threw an Error
 * TODO2: Spec
 * @template Result
 * @overload
 * @param {IsAsync_Not<Result>} callback
 * @returns {Error | Result}
 */
/**
 * @template Result
 * @overload
 * @param {IsAsync<Result>} callback
 * @returns {Promise<Error> | Result}
 */
/**
 * @template Result
 * @template DefaultIfError
 * @overload
 * @param {IsAsync<Result>} callback
 * @param {DefaultIfError} defaultIfError
 * @returns {Promise<DefaultIfError> | Result}
 */
/**
 * @template Result
 * @template DefaultIfError
 * @overload
 * @param {IsAsync_Not<Result>} callback
 * @param {DefaultIfError} defaultIfError
 * @returns {DefaultIfError | Result}
 */
/**
 * @template Result
 * @template DefaultIfError
 * @param {() => Result} callback
 * @param {DefaultIfError} [defaultIfError]
 * @returns {Error | Promise<Error> | DefaultIfError | Promise<DefaultIfError> | Result}
 */
export function tryCatch(callback, defaultIfError) {
	try {
		const result = callback();
		if (result instanceof Promise) {
			if (defaultIfError === undefined) {
				return result.catch(error => error); // eslint-disable-line @typescript-eslint/no-unsafe-return
			}
			return result.catch(() => defaultIfError);
		} else {
			return result;
		}
	} catch (error) {
		if (typeof defaultIfError === `undefined`) {
			return /** @type {Error} */(error);
		}
		return defaultIfError;
	}
}
