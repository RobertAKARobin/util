import { suite, test } from '../spec/index.js';
import { isNotNull } from '../isNotNull.js';

import { findOverlap, findOverlapCompareDefault } from './findOverlap.js';

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
	}),

	test(`different length overlaps`, $ => {
		overlap = subject(`a`, `a`);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap[0].length) === 1);
		$.assert(x => x(overlap[0].originIndex) === 0);
		$.assert(x => x(overlap[0].updateIndex) === 0);

		overlap = subject(`aaaa`, `aaaa`);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap[0].length) === 4);
		$.assert(x => x(overlap[0].originIndex) === 0);
		$.assert(x => x(overlap[0].updateIndex) === 0);

		overlap = subject(`aaaa`, `aaaaaaaaaaaaa`);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap[0].length) === 4);
		$.assert(x => x(overlap[0].originIndex) === 0);
		$.assert(x => x(overlap[0].updateIndex) === 0);
	}),

	test(`shorter overlap`, $ => {
		overlap = subject(`12345`, `a4bcde`);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap[0].length) === 1);
		$.assert(x => x(overlap[0].originIndex) === 3);
		$.assert(x => x(overlap[0].updateIndex) === 1);
	}),

	test(`longer overlap`, $ => {
		overlap = subject(`1234445`, `a444bcde`);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap[0].length) === 3);
		$.assert(x => x(overlap[0].originIndex) === 3);
		$.assert(x => x(overlap[0].updateIndex) === 1);
	}),

	test(`different length overlaps`, $ => {
		overlap = subject(`1234445`, `a4444bcde`);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap[0].length) === 3);
		$.assert(x => x(overlap[0].originIndex) === 3);
		$.assert(x => x(overlap[0].updateIndex) === 1);

		overlap = subject(`12344445`, `a444bcde`);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap[0].length) === 3);
		$.assert(x => x(overlap[0].originIndex) === 3);
		$.assert(x => x(overlap[0].updateIndex) === 1);
	}),

	test(`begin switch with end`, $ => {
		overlap = subject(`444123`, `abc444`);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap[0].length) === 3);
		$.assert(x => x(overlap[0].originIndex) === 0);
		$.assert(x => x(overlap[0].updateIndex) === 3);

		overlap = subject(`123444`, `444abc`);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap[0].length) === 3);
		$.assert(x => x(overlap[0].originIndex) === 3);
		$.assert(x => x(overlap[0].updateIndex) === 0);
	}),

	test(`begin switch with end, different lengths`, $ => {
		overlap = subject(`123444`, `444abcdef`);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap[0].length) === 3);
		$.assert(x => x(overlap[0].originIndex) === 3);
		$.assert(x => x(overlap[0].updateIndex) === 0);

		overlap = subject(`44412356789`, `abc444`);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap[0].length) === 3);
		$.assert(x => x(overlap[0].originIndex) === 0);
		$.assert(x => x(overlap[0].updateIndex) === 3);
	}),

	test(`overlap appears multiple times`, $ => {
		overlap = subject(`123564447890444123444`, `abc444abc444abc444`);
		$.assert(x => x(overlap.length) === 3);
		$.assert(x => x(overlap[0].length) === 3);
		$.assert(x => x(overlap[0].originIndex) === 5);
		$.assert(x => x(overlap[0].updateIndex) === 3);
	}),

	test(`case sensitive`, $ => {
		overlap = subject(`aabbCCddee`, `ccCC`);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap[0].length) === 2);
		$.assert(x => x(overlap[0].originIndex) === 4);
		$.assert(x => x(overlap[0].updateIndex) === 2);
	}),

	suite(`space delimited`, {},
		test(`single overlap`, $ => {
			const stringA = `aa xx yy bb`;
			const stringB = `ccc ddd xx yy eee`;

			overlap = subject(stringA, stringB, ` `);
			$.assert(x => x(overlap.length) === 1);
			$.assert(x => x(overlap[0].length) === 2);
			$.assert(x => x(overlap[0].originIndex) === 1);
			$.assert(x => x(overlap[0].updateIndex) === 2);

			overlap = subject(stringB, stringA, ` `);
			$.assert(x => x(overlap.length) === 1);
			$.assert(x => x(overlap[0].length) === 2);
			$.assert(x => x(overlap[0].originIndex) === 2);
			$.assert(x => x(overlap[0].updateIndex) === 1);
		}),

		test(`multiple overlaps`, $ => {
			const stringA = `x x 1 a a a 2 b b b b`;
			const stringB = `b b b b 3 a a a 4 x x`;

			overlap = subject(stringA, stringB, ` `);
			$.assert(x => x(overlap.length) === 3);

			$.assert(x => x(overlap[0].length) === 2);
			$.assert(x => x(overlap[0].originIndex) === 0);
			$.assert(x => x(overlap[0].updateIndex) === 9);

			$.assert(x => x(overlap[1].length) === 3);
			$.assert(x => x(overlap[1].originIndex) === 3);
			$.assert(x => x(overlap[1].updateIndex) === 5);

			$.assert(x => x(overlap[2].length) === 4);
			$.assert(x => x(overlap[2].originIndex) === 7);
			$.assert(x => x(overlap[2].updateIndex) === 0);

			overlap = subject(stringB, stringA, ` `);
			$.assert(x => x(overlap.length) === 3);

			$.assert(x => x(overlap[0].length) === 4);
			$.assert(x => x(overlap[0].originIndex) === 0);
			$.assert(x => x(overlap[0].updateIndex) === 7);

			$.assert(x => x(overlap[1].length) === 3);
			$.assert(x => x(overlap[1].originIndex) === 5);
			$.assert(x => x(overlap[1].updateIndex) === 3);

			$.assert(x => x(overlap[2].length) === 2);
			$.assert(x => x(overlap[2].originIndex) === 9);
			$.assert(x => x(overlap[2].updateIndex) === 0);
		}),
	),

	suite(`custom comparer`, {},
		test(`case insensitive`, $ => {
			overlap = subject(`aabbCCddee`, `ccCC`, ``, (origin, update) => {
				return findOverlapCompareDefault(origin.toLowerCase(), update.toLowerCase());
			});
			$.assert(x => x(overlap.length) === 1);
			$.assert(x => x(overlap[0].length) === 2);
			$.assert(x => x(overlap[0].originIndex) === 4);
			$.assert(x => x(overlap[0].updateIndex) === 0);
		}),

		test(`min length`, $ => {
			overlap = subject(`aa 4 bb 44 ccc`, `dd 4 ee 4 ff 44 g`, ` `, (origin, update) => {
				return findOverlapCompareDefault(origin, update) && origin.length >= 2;
			});
			$.assert(x => x(overlap.length) === 1);
			$.assert(x => x(overlap[0].length) === 1);
			$.assert(x => x(overlap[0].originIndex) === 3);
			$.assert(x => x(overlap[0].updateIndex) === 5);
		}),
	),
);
