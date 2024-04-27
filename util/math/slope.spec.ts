import { test } from '../spec/index.ts';

import { slope } from './slope.ts';

export const spec = test(`slope`, $ => {
	$.assert(x => x(slope({ x: 0, y: 0 }, { x: 3, y: 4 })) === x(4 / 3));
	$.assert(x => x(slope({ begin: { x: 0, y: 0 }, end: { x: 3, y: 4 } })) === x(4 / 3));
	$.assert(x => x(slope({ x: 0, y: 0 }, { x: 4, y: 4 })) === 1);
	$.assert(x => x(slope({ x: 0, y: 0 }, { x: -4, y: 4 })) === -1);
	$.assert(x => Number.isNaN(x(slope({ x: 0, y: 0 }, { x: 0, y: 0 })))); // Can't do `=== NaN` because Javscript is dumb and NaN isn't === to anything, not even NaN
});
