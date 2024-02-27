import { test } from './spec/index.ts';

import { tsvParse } from './tsvParse.ts';

const tsv = `
E120	953	1042	2
E138	946	1072	2
E141	946.5	1090	1.5
E144	951.5	1109.5	1.75
E146	916	1093	2
E172	916	1019	2
E215	947	1029.5	1.5
E264	948	1106	1.75
E320	948	1011	2.5
E344	938	1095	1.8
`;

export const spec = test(`fetchTsv`, $ => {
	const entries = tsvParse(tsv, ([id, x, y, scale]) => ({
		id,
		scale: parseFloat(scale),
		x: parseInt(x),
		y: parseInt(y),
	}));

	$.assert(x => x(entries.length) === 10);
	$.assert(x => x(entries[4].id) === `E146`);
	$.assert(x => x(entries[5].x) === 916);
	$.assert(x => x(entries[6].y) === 1029);
	$.assert(x => x(entries[7].scale) === 1.75);
});
