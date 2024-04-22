import { delay } from './delay.ts';

/**
 * Returns a promise that resolves after the provided milliseconds
 */
export function sleep(milliseconds: number) {
	return delay(() => undefined, milliseconds);
}
