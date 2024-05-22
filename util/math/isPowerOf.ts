import { preciseTo } from './preciseTo.ts';

/**
 * Returns whether the given input is a power of the given number
 */
export function isPowerOf(power: number, input: number) {
	return preciseTo(Math.log(input) / Math.log(power)) % 1 === 0; // https://stackoverflow.com/a/30924352/2053389
}
