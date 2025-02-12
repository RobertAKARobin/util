import { delay } from './delay.js';

/**
 * Returns a promise that resolves after the provided milliseconds
 * TODO1: Spec
 * @param {number} milliseconds
 * @returns {Promise<void>}
 */
export function sleep(milliseconds) {
	return delay(() => undefined, milliseconds);
}
