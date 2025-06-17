/**
 * @import { Timer } from '../types.d';
 */

/**
 * Debounce the given callback a single time, up until the given delay period elapses
 * TODO2: Spec
 * @template Input
 * @param {(input: Input) => void} callback
 * @param {number} milliseconds
 * @returns {(input: Input) => void}
 */
export function debounce(callback, milliseconds) {
	/** @type {Timer | null} */
	let timer = null;

	/**
	 * @param {Input} input
	 */
	return function(input) {
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			callback(input);
			timer = null;
		}, milliseconds);
	};
}
