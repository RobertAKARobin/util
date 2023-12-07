import { delay } from './delay.ts';

export function sleep(time: number) {
	return delay(() => undefined, time);
}
