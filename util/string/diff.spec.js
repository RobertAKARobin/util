import { suite, test } from '../spec/index.js';

import { diff as diff_ } from './diff.js';

/** @type {ReturnType<diff_>} */
let diff;

/** @type {string} */
let origin;
/** @type {string} */
let update;

function subject(
	/** @type {string} */origin,
	/** @type {string} */update,
	/** @type {string} */delimiter = ` `,
) {
	return diff_(origin, update, { delimiter });
}

export const spec = suite(import.meta.url, {},
	test(`same`, $ => {
		diff = subject(``, ``);
		$.assert(x => x(diff.length) === 0);

		diff = subject(` `, ` `);
		$.assert(x => x(diff.length) === 1);
		$.assert(x => x(diff[0].value) === ` `);

		diff = subject(`  `, `  `);
		$.assert(x => x(diff.length) === 1);
		$.assert(x => x(diff[0].value) === `  `);

		diff = subject(` a `, ` a `);
		$.assert(x => x(diff.length) === 1);
		$.assert(x => x(diff[0].value) === ` a `);
	}),

	test(`no overlap`, $ => {
		diff = subject(`aa bb cc`, `a b c`);
		$.assert(x => x(diff.length) === 2);

		$.assert(x => x(diff[0].value) === `aa bb cc`);
		$.assert(x => x(diff[0].action) === `removed`);

		$.assert(x => x(diff[1].value) === `a b c`);
		$.assert(x => x(diff[1].action) === `added`);

		diff = subject(`a b c`, `d e f`);
		$.assert(x => x(diff.length) === 2);

		$.assert(x => x(diff[0].value) === `a b c`);
		$.assert(x => x(diff[0].action) === `removed`);

		$.assert(x => x(diff[1].value) === `d e f`);
		$.assert(x => x(diff[1].action) === `added`);

		diff = subject(`a b c`, ` `);
		$.assert(x => x(diff.length) === 2);

		$.assert(x => x(diff[0].value) === `a b c`);
		$.assert(x => x(diff[0].action) === `removed`);

		$.assert(x => x(diff[1].value) === ` `);
		$.assert(x => x(diff[1].action) === `added`);
	}),

	test(`zero length`, $ => {
		diff = subject(`a b c`, ``);
		$.assert(x => x(diff.length) === 1);
		$.assert(x => x(diff[0].value) === `a b c`);
		$.assert(x => x(diff[0].action) === `removed`);

		diff = subject(``, `a b c`);
		$.assert(x => x(diff.length) === 1);
		$.assert(x => x(diff[0].value) === `a b c`);
		$.assert(x => x(diff[0].action) === `added`);
	}),

	test(`zero length vs spaces`, $ => {
		diff = subject(``, ` `);
		$.assert(x => x(diff.length) === 1);
		$.assert(x => x(diff[0].value) === ` `);
		$.assert(x => x(diff[0].action) === `added`);

		diff = subject(` `, ``);
		$.assert(x => x(diff.length) === 1);
		$.assert(x => x(diff[0].value) === ` `);
		$.assert(x => x(diff[0].action) === `removed`);
	}),

	test(`overlap in middle`, $ => {
		diff = subject(`y y a b c d e f`, `a b x x x e f`);
		$.assert(x => x(diff.length) === 5);

		$.assert(x => x(diff[0].value) === `y y`);
		$.assert(x => x(diff[0].action) === `removed`);

		$.assert(x => x(diff[1].value) === `a b`);
		$.assert(x => x(diff[1].action) === ``);

		$.assert(x => x(diff[2].value) === `c d`);
		$.assert(x => x(diff[2].action) === `removed`);

		$.assert(x => x(diff[3].value) === `x x x`);
		$.assert(x => x(diff[3].action) === `added`);

		$.assert(x => x(diff[4].value) === `e f`);
		$.assert(x => x(diff[4].action) === ``);
	}),

	test(`switch beginning to end`, $ => {
		diff = subject(`x x a a b b`, `a a b b x x`);
		$.assert(x => x(diff.length) === 3);

		$.assert(x => x(diff[0].value) === `x x`);
		$.assert(x => x(diff[0].action) === `removed`);

		$.assert(x => x(diff[1].value) === `a a b b`);
		$.assert(x => x(diff[1].action) === ``);

		$.assert(x => x(diff[2].value) === `x x`);
		$.assert(x => x(diff[2].action) === `added`);
	}),

	test(`switch both ends`, $ => {
		diff = subject(`x x b b a a`, `a a b b x x`);
		$.assert(x => x(diff.length) === 5);

		$.assert(x => x(diff[0].value) === `x x`);
		$.assert(x => x(diff[0].action) === `removed`);

		$.assert(x => x(diff[1].value) === `a a`);
		$.assert(x => x(diff[1].action) === `added`);

		$.assert(x => x(diff[2].value) === `b b`);
		$.assert(x => x(diff[2].action) === ``);

		$.assert(x => x(diff[3].value) === `a a`);
		$.assert(x => x(diff[3].action) === `removed`);

		$.assert(x => x(diff[4].value) === `x x`);
		$.assert(x => x(diff[4].action) === `added`);
	}),

	test(`overlap at end`, $ => {
		diff = subject(`a a b b x x`, `x x a a b b`);
		$.assert(x => x(diff.length) === 3);

		$.assert(x => x(diff[0].value) === `x x`);
		$.assert(x => x(diff[0].action) === `added`);

		$.assert(x => x(diff[1].value) === `a a b b`);
		$.assert(x => x(diff[1].action) === ``);

		$.assert(x => x(diff[2].value) === `x x`);
		$.assert(x => x(diff[2].action) === `removed`);
	}),

	suite(`multiline`, {},
		test(`same`, $ => {
			origin = `
aaa
aaa bbb
`;
			update = `
aaa
aaa bbb
`;
			diff = subject(origin, update, `\n`);
			$.assert(x => x(diff.length) === 1);
			$.assert(x => x(diff[0].action) === ``);
			$.assert(x => x(diff[0].value) === x(origin));
		}),

		test(`add line at end`, $ => {
			origin = `
aaa
aaa bbb
`;
			update = `
aaa
aaa bbb

`;
			diff = subject(origin, update, `\n`);
			$.assert(x => x(diff.length) === 2);
			$.assert(x => x(diff[0].action) === ``);
			$.assert(x => x(diff[0].value) === x(origin));
			$.assert(x => x(diff[1].action) === `added`);
			$.assert(x => x(diff[1].value) === `\n`);
		}),

		test(`add line at beginning`, $ => {
			origin = `
aaa
aaa bbb
	`;
			update = `

aaa
aaa bbb
	`;
			diff = subject(origin, update, `\n`);
			$.assert(x => x(diff.length) === 2);
		}),
	),

	test(`add line in middle`, $ => {
		diff = subject(
			`
aaa

aaa bbb
`,
			`
aaa


aaa bbb
`,
			`\n`,
		);

		$.assert(x => x(diff.length) === 2);
	}),
);
