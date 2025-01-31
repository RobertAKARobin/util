/**
 * @import { Result } from './delimiter-pairs';
 */

import { suite, test } from '../spec/index';

import { delimiterPairs } from './delimiter-pairs';


function at(/** @type {Result} */result) {
	return (/** @type {Array<number>} */...indexes) => {
		let current = result;
		let depth = 0;
		for (const index of indexes) {
			depth += 1;

			const value = current.inner[index];
			if (typeof value === `string`) {
				if (depth < indexes.length) {
					throw new Error(`${indexes.slice(0, depth)} is a string`);
				}
				return /** @type {string} */(value);
			}
			current = value;
		}

		return /** @type {Result} */(current);
	};
}

export const spec = suite(import.meta.url, {},
	test(`tags`, $ => {
		const tagA = [`<a>`, `</a>`];
		const tag1 = [`<1>`, `</1>`];
		const tag2 = [`<2>`, `</2>`];

		/** @type {ReturnType<typeof delimiterPairs>} */
		let result;
		$.log(() => result = delimiterPairs(`abcdef`));
		$.assert(x => x(result.inner.length) === 1);
		$.assert(x => x(at(result)(0)) === x(`abcdef`));

		$.log(() => result = delimiterPairs(`abc</a>de`, [tagA]));
		$.assert(x => x(result.inner.length) === 1);
		$.assert(x => x(at(result)(0)) === x(`abc</a>de`));

		$.log(() => result = delimiterPairs(`abc<a>de`, [tagA]));
		$.assert(x => x(result.inner.length) === 3);
		$.assert(x => x(at(result)(0)) === x(`abc`));;
		$.assert(x => x(/** @type {Result} */(at(result)(1)).indexTo) === x(-1));

		$.log(() => result = delimiterPairs(`a<a>bcd</a>e`, [tagA]));
		$.assert(x => x(at(result)(0)) === `a`);
		$.assert(x => x(/** @type {Result} */(at(result)(1)).delimiters.opener) === x(tagA[0]));
		$.assert(x => x(at(result)(1, 0)) === `bcd`);
		$.assert(x => x(at(result)(2)) === `e`);

		$.log(() => result = delimiterPairs(`a<a>b<a>c</a>d</a>e`, [tagA]));
		$.assert(x => x(result.indexFrom) === 0);
		$.assert(x => x(result.indexTo) === 19);
		$.assert(x => x(/** @type {Result} */(at(result)(1)).indexFrom) === 4);
		$.assert(x => x(/** @type {Result} */(at(result)(1)).indexTo) === 14);
		$.assert(x => x(/** @type {Result} */(at(result)(1, 1)).indexFrom) === 8);
		$.assert(x => x(/** @type {Result} */(at(result)(1, 1)).indexTo) === 9);
		$.assert(x => x(at(result)(0)) === `a`);
		$.assert(x => x(at(result)(1, 0)) === `b`);
		$.assert(x => x(at(result)(1, 1, 0)) === `c`);
		$.assert(x => x(at(result)(1, 2)) === `d`);
		$.assert(x => x(at(result)(2)) === `e`);

		$.assert(x => x(/** @type {Result} */(at(result)(1, 1)).indexFrom) === 8);
		$.assert(x => x(/** @type {Result} */(at(result)(1, 1)).indexTo) === 9);

		$.log(() => result = delimiterPairs(`a<a>bc</a>d</a>e`, [tagA]));
		$.assert(x => x(result.inner[0]) === `a`);
		$.assert(x => x(/** @type {Result} */(result.inner[1]).inner[0]) === `bc`);
		$.assert(x => x(result.inner[2]) === `d</a>e`);

		$.log(() => result = delimiterPairs(`a<a>bc<a>d</a>e`, [tagA]));
		$.assert(x => x(at(result)(0)) === `a`);
		$.assert(x => x(at(result)(1, 0)) === `bc`);
		$.assert(x => x(at(result)(1, 1, 0)) === `d`);
		$.assert(x => x(at(result)(2)) === `e`);

		$.log(() => result = delimiterPairs(`a<a>bb<a>ccc</a>dddd</a>eeeee`, [tagA]));
		$.assert(x => x(at(result)(0)) === `a`);
		$.assert(x => x(at(result)(1, 0)) === `bb`);
		$.assert(x => x(at(result)(1, 1, 0)) === `ccc`);
		$.assert(x => x(at(result)(1, 2)) === `dddd`);
		$.assert(x => x(at(result)(2)) === `eeeee`);

		$.log(() => result = delimiterPairs(`a<a>bb</a>ccc</a>dddd</a>eeeee`, [tagA]));
		$.assert(x => x(at(result)(0)) === `a`);
		$.assert(x => x(at(result)(1, 0)) === `bb`);
		$.assert(x => x(at(result)(2)) === `ccc</a>dddd</a>eeeee`);

		$.log(() => result = delimiterPairs(`a<a>bb</a>ccc<a>dddd</a>eeeee`, [tagA]));
		$.assert(x => x(at(result)(0)) === `a`);
		$.assert(x => x(at(result)(1, 0)) === `bb`);
		$.assert(x => x(at(result)(2)) === `ccc`);
		$.assert(x => x(at(result)(3, 0)) === `dddd`);
		$.assert(x => x(at(result)(4)) === `eeeee`);

		$.log(() => result = delimiterPairs(`a<a>bb<a>ccc<a>dddd</a>eeeee`, [tagA]));
		$.assert(x => x(at(result)(0)) === `a`);
		$.assert(x => x(at(result)(1, 0)) === `bb`);
		$.assert(x => x(at(result)(1, 1, 0)) === `ccc`);
		$.assert(x => x(at(result)(1, 1, 1, 0)) === `dddd`);
		$.assert(x => x(at(result)(2)) === `eeeee`);

		$.log(() => result = delimiterPairs(`a<1>bb<2>ccc</2>dddd</1>eeeee`, [tag1]));
		$.assert(x => x(at(result)(0)) === `a`);
		$.assert(x => x(at(result)(1, 0)) === `bb<2>ccc</2>dddd`);
		$.assert(x => x(at(result)(2)) === `eeeee`);

		$.log(() => result = delimiterPairs(`a<1>bb<2>ccc</2>dddd</1>eeeee`, [tag1, tag2]));
		$.assert(x => x(at(result)(0)) === `a`);
		$.assert(x => x(at(result)(1, 0)) === `bb`);
		$.assert(x => x(at(result)(1, 1, 0)) === `ccc`);
		$.assert(x => x(at(result)(1, 2)) === `dddd`);
		$.assert(x => x(at(result)(2)) === `eeeee`);

		$.log(() => result = delimiterPairs(`a<1>bb<2>ccc</1>dddd</2>eeeee`, [tag1, tag2]));
		$.assert(x => x(at(result)(0)) === `a`);
		$.assert(x => x(at(result)(1, 0)) === `bb`);
		$.assert(x => x(at(result)(1, 1, 0)) === `ccc</1>dddd`);
		$.assert(x => x(at(result)(2)) === `eeeee`);
	}),

	test(`templates`, $ => {
		const tags = [
			[`/*css*/\``, `\``],
			[`\${`, `}`],
		];
		const template = `export const foo = /*css*/\`
:host {
	color: red;
}
\`;

const color = \`blue\`;
const colors: Array<string> = [];
export const bar = /*css*/\`
:host {
	color: \${color};

	\${colors.map(color => /*css*/\`
		--color-\${color}: \${color};
	\`)}
}
\`;
`; // Had this in a `util/mock` file, but that made the test hard to run in the browser

		const result = delimiterPairs(template, tags);
		const resultAt = at(result);

		const tagLength = (/** @type {string} */ input) => input.replace(/\\/g, ``).length;
		const tag0OpenerLength = tagLength(tags[0][0]);
		const tag0CloserLength = tagLength(tags[0][1]);
		const tag1OpenerLength = tagLength(tags[1][0]);
		const tag1CloserLength = tagLength(tags[0][1]);
		$.assert(x => x(tag0OpenerLength) === 8);
		$.assert(x => x(tag0CloserLength) === 1);
		$.assert(x => x(tag1OpenerLength) === 2);
		$.assert(x => x(tag1CloserLength) === 1);

		let indexFrom = result.indexFrom;
		$.assert(x => x(result.indexFrom) === x(indexFrom));

		let inner = `export const foo = `;
		$.assert(x => x(resultAt(0)) === x(inner));

		indexFrom += inner.length + tag0OpenerLength;
		inner = `
:host {
	color: red;
}
`;
		$.assert(x => x(/** @type {Result} */(resultAt(1)).indexFrom) === x(indexFrom));
		$.assert(x => x(resultAt(1, 0)) === x(inner));

		$.assert(x => x(resultAt(2)) === x(`;

const color = \`blue\`;
const colors: Array<string> = [];
export const bar = `));

		$.assert(x => x(at(result)(3, 0)) === x(`
:host {
	color: `));

		$.assert(x => x(resultAt(3, 1, 0)) === x(`color`));

		$.assert(x => x(resultAt(3, 2)) === x(`;

	`));

		$.assert(x => x(resultAt(3, 3, 0)) === x(`colors.map(color => `));

		$.assert(x => x(resultAt(3, 3, 1, 0)) === x(`
		--color-`));

		$.assert(x => x(resultAt(3, 3, 1, 1, 0)) === x(`color`));

		$.assert(x => x(resultAt(3, 3, 1, 2)) === x(`: `));

		$.assert(x => x(resultAt(3, 3, 1, 3, 0)) === x(`color`));

		$.assert(x => x(resultAt(3, 3, 1, 4)) === x(`;
	`));

		$.assert(x => x(resultAt(3, 3, 2)) === x(`)`));

		$.assert(x => x(resultAt(3, 4)) === x(`
}
`));

		$.assert(x => x(resultAt(4)) === x(`;
`));
	}),
);
