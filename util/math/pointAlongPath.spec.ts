import { test } from '../spec/index.ts';

import { pointAlongPath } from './pointAlongPath.ts';
import { pointToString } from './pointToString.ts';
import segments from '../mock/segments.json';

export const spec = test(import.meta.url, $ => {
	const result = (x: number, y: number) => {
		const out = pointAlongPath([x, y], segments, 1);
		return pointToString(out);
	};

	$.assert(x => x(result(25, 0)) === `25,5`);
	$.assert(x => x(result(0, 0)) === `5,5`);
	$.assert(x => x(result(0, 7)) === `5,7`);
	$.assert(x => x(result(5, 5)) === `5,5`);
	$.assert(x => x(result(95, 45)) === `95,50`);
	$.assert(x => x(result(44, 95)) === `44,93`);
	$.assert(x => x(result(95, 95)) === `95,70`);
	$.assert(x => x(result(95, 84)) === `95,70`);
	$.assert(x => x(result(4, 39)) === `5,39`);
});
