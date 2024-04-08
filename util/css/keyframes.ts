import { roundTo } from '../math/roundTo.ts';

/**
 * Returns the contents of a CSS `@keyframes` at-rule, calculating the duration % for each step. For each arg, if it's a number it increases the duration. If it's a string it outputs another step at the duration % so far.
 */
export function keyframes(
	...args: [string, ...Array<number | string>]
) {
	const timeTotal = args.reduce((sum: number, arg) => {
		return sum += (typeof arg === `number` ? arg : 0);
	}, 0);

	const out: Array<string> = [];

	let previousKeyframe: string = ``;
	let timeSoFar = 0;
	for (const arg of args) {
		if (typeof arg === `number`) {
			timeSoFar += arg;

			if (previousKeyframe !== ``) {
				const percent = roundTo(100 * (timeSoFar / timeTotal), 2);
				out.push(`${percent}% {${previousKeyframe}}`);
			}
		} else {
			previousKeyframe = arg;
		}
	}
	return out.join(`\n`);
}
