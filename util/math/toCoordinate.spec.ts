import { test } from '../spec/index.ts';

import { toCoordinate } from './toCoordinate.ts';

export const spec = test(`toCoordinate`, $ => {
	$.assert(x => x(toCoordinate([3, 6])).x === 3);
	$.assert(x => x(toCoordinate([3, 6])).y === 6);
	$.assert(x => x(toCoordinate([3, 6, 9])).x === 3);
	$.assert(x => x(toCoordinate([3, 6, 9])).y === 6);
	$.assert(x => x(toCoordinate([3, -6])).x === 3);
	$.assert(x => x(toCoordinate([3, -6])).y === -6);
	$.assert(x => x(toCoordinate([-3, -6])).x === -3);
	$.assert(x => x(toCoordinate([-3, -6])).y === -6);
	$.assert(x => x(toCoordinate({ x: 3, y: 6 })).x === 3);
	$.assert(x => x(toCoordinate({ x: 3, y: 6 })).y === 6);
});
