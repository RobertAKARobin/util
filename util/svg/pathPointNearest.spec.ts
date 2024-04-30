import { test } from '../spec/index.ts';

import { pathPointNearest } from './pathPointNearest.ts';

export const spec = test(`pathPointNearest`, $ => {
	const path = document.querySelector(`path`)!;

	function result(x: number, y: number) {
		const out = pathPointNearest(path, [x, y]);
		return `${out.x},${out.y}`;
	}

	$.assert(x => x(result(25, 0)) === `25,5`);
	$.assert(x => x(result(0, 0)) === `5,5`);
	$.assert(x => x(result(5, 5)) === `5,5`);
	$.assert(x => x(result(95, 45)) === `95,50`);
	$.assert(x => x(result(44, 95)) === `44,93`);
});
