import { suite, test } from '../spec/index.js';
import { isNotNull } from '../isNotNull.js';

import { findOverlap, findOverlapCompareDefault, findOverlaps } from './findOverlap.js';

/** @type {ReturnType<findOverlap>} */
let overlap;

function subject(
	/** @type {string} */origin,
	/** @type {string} */update,
	/** @type {string} */delimiter = ``,
	/** @type {typeof findOverlapCompareDefault<string>} */compare = findOverlapCompareDefault,
) {
	const out = findOverlap(origin.split(delimiter), update.split(delimiter), { compare });
	return isNotNull(out);
}

export const spec = suite(import.meta.url, {},
	test(`no overlap`, $ => {
		overlap = subject(`12345`, `abcde`);
		$.assert(x => x(overlap.length) === 0);
		$.assert(x => x(overlap.originIndex) === -1);
		$.assert(x => x(overlap.updateIndex) === -1);
	}),

	test(`different length overlaps`, $ => {
		overlap = subject(`a`, `a`);
		$.assert(x => x(overlap.originIndex) === 0);
		$.assert(x => x(overlap.updateIndex) === 0);
		$.assert(x => x(overlap.length) === 1);

		overlap = subject(`aaaa`, `aaaa`);
		$.assert(x => x(overlap.originIndex) === 0);
		$.assert(x => x(overlap.updateIndex) === 0);
		$.assert(x => x(overlap.length) === 4);

		overlap = subject(`aaaa`, `aaaaaaaaaaaaa`);
		$.assert(x => x(overlap.originIndex) === 0);
		$.assert(x => x(overlap.updateIndex) === 0);
		$.assert(x => x(overlap.length) === 4);
	}),

	test(`shorter overlap`, $ => {
		overlap = subject(`12345`, `a4bcde`);
		$.assert(x => x(overlap.originIndex) === 3);
		$.assert(x => x(overlap.updateIndex) === 1);
		$.assert(x => x(overlap.length) === 1);
	}),

	test(`longer overlap`, $ => {
		overlap = subject(`1234445`, `a444bcde`);
		$.assert(x => x(overlap.originIndex) === 3);
		$.assert(x => x(overlap.updateIndex) === 1);
		$.assert(x => x(overlap.length) === 3);
	}),

	test(`different length overlaps`, $ => {
		overlap = subject(`1234445`, `a4444bcde`);
		$.assert(x => x(overlap.originIndex) === 3);
		$.assert(x => x(overlap.updateIndex) === 1);
		$.assert(x => x(overlap.length) === 3);

		overlap = subject(`12344445`, `a444bcde`);
		$.assert(x => x(overlap.originIndex) === 3);
		$.assert(x => x(overlap.updateIndex) === 1);
		$.assert(x => x(overlap.length) === 3);
	}),

	test(`start v end`, $ => {
		overlap = subject(`444123`, `abc444`);
		$.assert(x => x(overlap.originIndex) === 0);
		$.assert(x => x(overlap.updateIndex) === 3);
		$.assert(x => x(overlap.length) === 3);

		$.log(`different length sources`);
		overlap = subject(`123444`, `444abcdef`);
		$.assert(x => x(overlap.originIndex) === 3);
		$.assert(x => x(overlap.updateIndex) === 0);
		$.assert(x => x(overlap.length) === 3);

		overlap = subject(`444123456789`, `abc444`);
		$.assert(x => x(overlap.originIndex) === 0);
		$.assert(x => x(overlap.updateIndex) === 3);
		$.assert(x => x(overlap.length) === 3);
	}),

	test(`overlap appears multiple times`, $ => {
		overlap = subject(`123564447890444123444`, `abc444abc444abc444`);
		$.assert(x => x(overlap.originIndex) === 5);
		$.assert(x => x(overlap.updateIndex) === 3);
		$.assert(x => x(overlap.length) === 3);
	}),

	test(`case insensitive`, $ => {
		overlap = subject(`aabbCCddee`, `ccCC`);
		$.assert(x => x(overlap.originIndex) === 4);
		$.assert(x => x(overlap.updateIndex) === 2);
		$.assert(x => x(overlap.length) === 2);
	}),

	test(`space delimited`, $ => {
		overlap = subject(`aa xx yy bb`, `ccc ddd xx yy eee`, ` `);
		$.assert(x => x(overlap.originIndex) === 1);
		$.assert(x => x(overlap.updateIndex) === 2);
		$.assert(x => x(overlap.length) === 2);
	}),

	test(`custom comparer`, $ => {
		overlap = subject(`aabbCCddee`, `ccCC`, ``, (origin, update) => {
			return findOverlapCompareDefault(origin.toLowerCase(), update.toLowerCase());
		});
		$.assert(x => x(overlap.originIndex) === 4);
		$.assert(x => x(overlap.updateIndex) === 0);
		$.assert(x => x(overlap.length) === 2);

		overlap = subject(`aa 4 bb 44 ccc`, `dd 4 ee 4 ff 44 g`, ` `, (origin, update) => {
			return findOverlapCompareDefault(origin, update) && origin.length >= 2;
		});
		$.assert(x => x(overlap.originIndex) === 3);
		$.assert(x => x(overlap.updateIndex) === 5);
		$.assert(x => x(overlap.length) === 1);
	}),

	test(`findOverlaps`, $ => {
		let overlaps = findOverlaps(`x x 1 a a a 2 b b b b`.split(` `), `b b b b 3 a a a 4 x x`.split(` `));

		$.assert(x => x(overlaps.length) === 3);

		$.assert(x => x(overlaps[0].length) === 2);
		$.assert(x => x(overlaps[0].originIndex) === 0);
		$.assert(x => x(overlaps[0].updateIndex) === 9);

		$.assert(x => x(overlaps[1].length) === 3);
		$.assert(x => x(overlaps[1].originIndex) === 3);
		$.assert(x => x(overlaps[1].updateIndex) === 5);

		$.assert(x => x(overlaps[2].length) === 4);
		$.assert(x => x(overlaps[2].originIndex) === 7);
		$.assert(x => x(overlaps[2].updateIndex) === 0);
	}),
);
