import { suite, test } from '../spec/index.js';

import { findOverlap } from './findOverlap.js';

/** @type {ReturnType<findOverlap>} */
let overlap;

function subject(
	/** @type {string} */origin,
	/** @type {string} */update,
	/** @type {string} */delimiter = ``,
	/** @type {Parameters<typeof findOverlap<string>>[2]} */options = {},
) {
	const out = findOverlap(
		origin.split(delimiter),
		update.split(delimiter),
		options,
	);
	return out;
}

export const spec = suite(import.meta.url, {},
	test(`multiple occurrences of an overlap`, $ => {
		const stringA = `1 2 3 x y 4`;
		const stringB = `a x y z b c x y z z d e`;
		overlap = subject(stringA, stringB, ` `);
		$.assert(x => x(overlap.length) === 2);

		overlap = subject(stringB, stringA, ` `);
		$.assert(x => x(overlap.length) === 2);
	}),

	test(`no overlap`, $ => {
		overlap = subject(`12345`, `abcde`);
		$.assert(x => x(overlap.length) === 0);

		overlap = subject(``, ``);
		$.assert(x => x(overlap.length) === 0);
	}),

	test(`single overlap`, $ => {
		overlap = subject(`123X4`, `aXbcde`);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap.indexA) === 3);
		$.assert(x => x(overlap.indexB) === 1);

		overlap = subject(`123XXX4`, `aXXXbcdefgh`);
		$.assert(x => x(overlap.length) === 3);
		$.assert(x => x(overlap.indexA) === 3);
		$.assert(x => x(overlap.indexB) === 1);
	}),

	test(`origin and update are identical`, $ => {
		overlap = subject(`a`, `a`);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap.indexA) === 0);
		$.assert(x => x(overlap.indexB) === 0);

		overlap = subject(`aaa`, `aaa`);
		$.assert(x => x(overlap.length) === 3);
		$.assert(x => x(overlap.indexA) === 0);
		$.assert(x => x(overlap.indexB) === 0);

		overlap = subject(`abc`, `abc`);
		$.assert(x => x(overlap.length) === 3);
		$.assert(x => x(overlap.indexA) === 0);
		$.assert(x => x(overlap.indexB) === 0);
	}),

	test(`multiple identical overlaps`, $ => {
		overlap = subject(`aaa`, `aaaaaa`);
		$.assert(x => x(overlap.length) === 3);
		$.assert(x => x(overlap.indexA) === 0);
		$.assert(x => x(overlap.indexB) === 0);

		overlap = subject(`aaaaaa`, `aaa`);
		$.assert(x => x(overlap.length) === 3);
		$.assert(x => x(overlap.indexA) === 0);
		$.assert(x => x(overlap.indexB) === 0);

		overlap = subject(`123XX5`, `aXXXXbcde`);
		$.assert(x => x(overlap.length) === 2);
		$.assert(x => x(overlap.indexA) === 3);
		$.assert(x => x(overlap.indexB) === 1);

		overlap = subject(`123XXXX5`, `aXXbcde`);
		$.assert(x => x(overlap.length) === 2);
		$.assert(x => x(overlap.indexA) === 3);
		$.assert(x => x(overlap.indexB) === 1);

		overlap = subject(`123XX5`, `aXXXbcXXXXde`);
		$.assert(x => x(overlap.length) === 2);
		$.assert(x => x(overlap.indexA) === 3);
		$.assert(x => x(overlap.indexB) === 1);
	}),

	test(`finds the longest`, $ => {
		overlap = subject(`1ab2abc34abcd`, `5abc6abcd`);
		$.assert(x => x(overlap.length) === 4);
		$.assert(x => x(overlap.indexA) === 9);
		$.assert(x => x(overlap.indexB) === 5);
	}),

	test(`case sensitive`, $ => {
		overlap = subject(`123XX4`, `abxxXXcd`);
		$.assert(x => x(overlap.length) === 2);
		$.assert(x => x(overlap.indexA) === 3);
		$.assert(x => x(overlap.indexB) === 4);
	}),

	suite(`custom comparer`, {},
		test(`case insensitive`, $ => {
			overlap = subject(`123XX4`, `abxxXXcd`, ``, {
				compare: (origin, update) =>
					origin.toLowerCase() === update.toLowerCase(),
			});
			$.assert(x => x(overlap.length) === 2);
			$.assert(x => x(overlap.indexA) === 3);
			$.assert(x => x(overlap.indexB) === 2);
		}),
	),

	suite(`custom filter`, {},
		test(`min length`, $ => {
			overlap = subject(
				`1 XX Y 22 XX YY 333 4444`,
				`aa XX Y bb XX YY cc XX d`,
				` `,
				{
					filter: input => {
						return input.length >= 2;
					},
				},
			);
			$.assert(x => x(overlap.length) === 2);
			$.assert(x => x(overlap.indexA) === 4);
			$.assert(x => x(overlap.indexB) === 4);
		}),
	),

	test(`overlap at end`, $ => {
		overlap = subject(`1234x`, `xABC`);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap.indexA) === 4);
		$.assert(x => x(overlap.indexB) === 0);

		overlap = subject(`xABC`, `1234x`);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap.indexA) === 0);
		$.assert(x => x(overlap.indexB) === 4);
	}),

	test(`single overlap at either end`, $ => {
		let longer = `1234x`;
		let shorter = `x`;
		overlap = subject(longer, shorter);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap.indexA) === 4);
		$.assert(x => x(overlap.indexB) === 0);

		overlap = subject(shorter, longer);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap.indexA) === 0);
		$.assert(x => x(overlap.indexB) === 4);

		longer = `x1234`;
		overlap = subject(longer, shorter);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap.indexA) === 0);
		$.assert(x => x(overlap.indexB) === 0);

		overlap = subject(shorter, longer);
		$.assert(x => x(overlap.length) === 1);
		$.assert(x => x(overlap.indexA) === 0);
		$.assert(x => x(overlap.indexB) === 0);
	}),

	test(`returns earliest overlap`, $ => {
		overlap = subject(`x x b b a a`, `a a b b x x`, ` `);
		$.assert(x => x(overlap.length) === 2);
		$.assert(x => x(overlap.indexA) === 4);
		$.assert(x => x(overlap.indexB) === 0);
	}),
);
