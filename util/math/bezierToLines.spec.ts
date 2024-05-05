import type { Bezier } from '../types.d.ts';
import { test } from '../spec/index.ts';

import { bezierToLines } from './bezierToLines.ts';
import { distance } from './distance.ts';
import { mean } from './average.ts';
import segments from '../mock/segments.json';

export const spec = test(`bezierToLines`, $ => {
	const bezier = segments[1] as Bezier;

	let tolerance = 1;
	while (tolerance <= 10) {
		$.log(`tolerance: ${tolerance}`);
		const lines = bezierToLines(...bezier, tolerance);
		$.log(`lines: ${lines.length}`);
		$.assert(x => x(lines[0].begin.x) === 50);
		$.assert(x => x(lines[0].begin.y) === 5);
		$.assert(x => x(lines[lines.length - 1].end.x) === 50);
		$.assert(x => x(lines[lines.length - 1].end.y) === 50);

		const distances = lines.map(({ begin, end }) => distance([begin, end]));
		$.assert(x => x(mean(...distances)) < tolerance);
		tolerance += 1;
	}
});
