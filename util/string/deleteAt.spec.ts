import { test } from '../spec/index.ts';

import { deleteAt } from './deleteAt.ts';

export const spec = test(`deleteAt`, $ => {
	$.assert(x => x(deleteAt(`abcdef`, 3)) === `abcef`);
	$.assert(x => x(deleteAt(`abcdef`, 3, -2)) === `aef`);
	$.assert(x => x(deleteAt(`abcdef`, 3, -1)) === `abef`);
	$.assert(x => x(deleteAt(`abcdef`, 3, 0)) === `abcef`);
	$.assert(x => x(deleteAt(`abcdef`, 3, 1)) === `abcf`);
	$.assert(x => x(deleteAt(`abcdef`, 3, 2)) === `abc`);
	$.assert(x => x(deleteAt(`abcdef`, 3, 3)) === `abc`);

	$.assert(x => x(deleteAt(`abcdef`, 2, -2)) === `def`);
	$.assert(x => x(deleteAt(`abcdef`, 2, -1)) === `adef`);
	$.assert(x => x(deleteAt(`abcdef`, 2)) === `abdef`);
	$.assert(x => x(deleteAt(`abcdef`, 2, 0)) === `abdef`);
	$.assert(x => x(deleteAt(`abcdef`, 2, 1)) === `abef`);
	$.assert(x => x(deleteAt(`abcdef`, 2, 2)) === `abf`);
	$.assert(x => x(deleteAt(`abcdef`, 2, 3)) === `ab`);
	$.assert(x => x(deleteAt(`abcdef`, 2, 4)) === `ab`);

	$.assert(x => x(deleteAt(`abcdef`)) === `abcde`);
	$.assert(x => x(deleteAt(`abcdef`, null, -1)) === `abcd`);
	$.assert(x => x(deleteAt(`abcdef`, null, 1)) === `abcde`);
});
