import { delay } from './delay';

/**
 * Returns a promise that resolves after the provided milliseconds
 */
export function sleep(milliseconds: number) {
	return delay(() => undefined, milliseconds);
}
