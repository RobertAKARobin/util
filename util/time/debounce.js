/**
 * @import { Timeout } from '../types.d';
 */

/**
 * Prevent the given callback from being called more than once until the given period has elapsed
 * @template {(...args: any) => void} Callback
 * @param {Callback} callback
 * @param {number} milliseconds
 * @returns {Callback}
 */
export function debounce(callback, milliseconds) {
	/** @type {Timeout | null} */
	let timeout = null;

	return /** @type {Callback} */((...args) => {
		if (timeout) {
			clearTimeout(timeout);
		} else {
			callback(...args); // eslint-disable-line @typescript-eslint/no-unsafe-argument
		}

		timeout = setTimeout(() => timeout = null, milliseconds);
	});
}
