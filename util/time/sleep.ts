import { delay } from './delay.ts';

export function sleep(milliseconds: number) {
	return delay(() => undefined, milliseconds);
}
