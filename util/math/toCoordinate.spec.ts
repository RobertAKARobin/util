import { test } from '../spec/index.ts';

import { toCoordinate } from './toCoordinate.ts';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(toCoordinate([3, 6]).x) === 3);
	$.assert(x => x(toCoordinate([3, 6]).y) === 6);
	$.assert(x => x(toCoordinate([3, 6, 9]).x) === 3);
	$.assert(x => x(toCoordinate([3, 6, 9]).y) === 6);
	$.assert(x => x(toCoordinate([3, -6]).x) === 3);
	$.assert(x => x(toCoordinate([3, -6]).y) === -6);
	$.assert(x => x(toCoordinate([-3, -6]).x) === -3);
	$.assert(x => x(toCoordinate([-3, -6]).y) === -6);
	$.assert(x => x(toCoordinate({ x: 3, y: 6 }).x) === 3);
	$.assert(x => x(toCoordinate({ x: 3, y: 6 }).y) === 6);
	$.assert(x => x(toCoordinate(`3,6`).x) === 3);
	$.assert(x => x(toCoordinate(`3,6`).y) === 6);
	$.assert(x => x(toCoordinate(`4  7`).x) === 4);
	$.assert(x => x(toCoordinate(`4  7`).y) === 7);
});
