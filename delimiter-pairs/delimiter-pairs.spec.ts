import fs from 'fs';
import path from 'path';

import { suite, test } from '../spec/index.ts';
import { tryCatch } from '../tryCatch.ts';

import { delimiterPairs, type Result } from './delimiter-pairs.ts';

const readFile = (filepath: string) => {
	const dirname = new URL(`.`, import.meta.url).pathname;
	const abspath = path.join(dirname, filepath);
	return fs.readFileSync(abspath, { encoding: `utf8` });
};

function at<ReturnType extends string | Result = string>(result: Result) {
	return (...indexes: Array<number>): ReturnType => {
		let current = result;
		let depth = 0;
		for (const index of indexes) {
			depth += 1;

			const value = current.inner[index];
			if (typeof value === `string`) {
				if (depth < indexes.length) {
					throw new Error(`${indexes.slice(0, depth)} is a string`);
				}
				return value as ReturnType;
			}
			current = value;
		}

		return current as ReturnType;
	};
}

export const spec = suite(`stringMates`, {},
	test(`tags`, $ => {
		const tagA = [`<a>`, `</a>`];
		const tag1 = [`<1>`, `</1>`];
		const tag2 = [`<2>`, `</2>`];

		let result: ReturnType<typeof delimiterPairs>;
		$.log(() => result = delimiterPairs(`abcdef`));
		$.assert(x => x(result.inner.length) === 1);
		$.assert(x => x(at(result)(0)) === x(`abcdef`));

		$.log(() => result = delimiterPairs(`abc</a>de`, [tagA]));
		$.assert(x => x(result.inner.length) === 1);
		$.assert(x => x(at(result)(0)) === x(`abc</a>de`));

		$.assert(() => tryCatch(() => delimiterPairs(`abc<a>de`, [tagA])) instanceof Error);

		$.log(() => result = delimiterPairs(`a<a>bcd</a>e`, [tagA]));
		$.assert(x => x(at(result)(0)) === `a`);
		$.assert(x => x(at<Result>(result)(1).delimiters) === x(tagA));
		$.assert(x => x(at(result)(1, 0)) === `<a>bcd</a>`);
		$.assert(x => x(at(result)(2)) === `e`);

		// $.log(() => result = delimiterPairs(`a<a>bc</a>d</a>e`, [tagA]));
		// $.assert(x => x(result.inner[0]) === `a`);
		// $.assert(x => x((result.inner[1] as Result).inner[0]) === `bc`);
		// $.assert(x => x(result[2]) === `d</a>e`);

		// $.log(() => result = mates(`a<a>bc<a>d</a>e`, [tagA]));
		// $.assert(x => x(result[0]) === `a`);
		// $.assert(x => x((result[1] as TagResult).contents[0]) === `bc<a>d`);
		// $.assert(x => x(result[2]) === `e`);

		// $.log(() => result = mates(`a<a>bb<a>ccc</a>dddd</a>eeeee`, [tagA]));
		// $.assert(x => x(result[0]) === `a`);
		// $.assert(x => x((result[1] as TagResult).contents[0]) === `bb`);
		// $.assert(x => x(((result[1] as TagResult).contents[1] as TagResult).contents[0]) === `ccc`);
		// $.assert(x => x((result[1] as TagResult).contents[2]) === `dddd`);
		// $.assert(x => x(result[2]) === `eeeee`);

		// $.log(() => result = mates(`a<a>bb</a>ccc</a>dddd</a>eeeee`, [tagA]));
		// $.assert(x => x(result[0]) === `a`);
		// $.assert(x => x((result[1] as TagResult).contents[0]) === `bb`);
		// $.assert(x => x(result[2]) === `ccc</a>dddd</a>eeeee`);

		// $.log(() => result = mates(`a<a>bb</a>ccc<a>dddd</a>eeeee`, [tagA]));
		// $.assert(x => x(result[0]) === `a`);
		// $.assert(x => x((result[1] as TagResult).contents[0]) === `bb`);
		// $.assert(x => x(result[2]) === `ccc`);
		// $.assert(x => x((result[3] as TagResult).contents[0]) === `dddd`);
		// $.assert(x => x(result[4]) === `eeeee`);

		// $.log(() => result = mates(`a<a>bb<a>ccc<a>dddd</a>eeeee`, [tagA]));
		// $.assert(x => x(result[0]) === `a`);
		// $.assert(x => x((result[1] as TagResult).contents[0]) === `bb<a>ccc<a>dddd`);
		// $.assert(x => x(result[2]) === `eeeee`);

		// $.log(() => result = mates(`a<1>bb<2>ccc</2>dddd</1>eeeee`, [tag1]));
		// $.assert(x => x(result[0]) === `a`);
		// $.assert(x => x((result[1] as TagResult).contents[0]) === `bb<2>ccc</2>dddd`);

		// $.log(() => result = mates(`a<1>bb<2>ccc</2>dddd</1>eeeee`, [tag1, tag2]));
		// $.assert(x => x(result[0]) === `a`);
		// $.assert(x => x((result[1] as TagResult).contents[0]) === `bb`);
		// $.assert(x => x((result[1] as TagResult).tags) === tag1);
		// $.assert(x => x(((result[1] as TagResult).contents[1] as TagResult).contents[0]) === `ccc`);
		// $.assert(x => x(((result[1] as TagResult).contents[1] as TagResult).tags) === tag2);

		// $.log(() => result = mates(`a<1>bb<2>ccc</1>dddd</2>eeeee`, [tag1, tag2]));
		// $.assert(x => x(result[0]) === `a`);
		// $.assert(x => x((result[1] as TagResult).contents[0]) === `bb<2>ccc`);
	}),

	test(`templates`, $ => {
		const tags = [
			[`\\/\\*css\\*\\/\``, `\``],
			[`\\$\\{`, `\\}`],
		];
		const template = readFile(`./templates/css.ts`);
		const result = delimiterPairs(template, tags);
		const atResult = at(result);

		$.assert(x => x(atResult(0)) === `export const foo = `);

		$.assert(x => x(atResult(1, 0)) === x(`/*css*/\`
:host {
	color: red;
}
\``));

		$.assert(x => x(atResult(2)) === x(`;

const color = \`blue\`;
const colors: Array<string> = [];
export const bar = `));

		$.assert(x => x(at(result)(3, 0)) === x(`/*css*/\`
:host {
	color: `));

		$.assert(x => x(atResult(3, 1, 0)) === x(`\${color}`));

		$.assert(x => x(atResult(3, 2)) === x(`;

	`));

		$.assert(x => x(atResult(3, 3, 0)) === x(`\${colors.map(color => `));

		$.assert(x => x(atResult(3, 3, 1, 0)) === x(`/*css*/\`
		--color-`));

		$.assert(x => x(atResult(3, 3, 1, 1, 0)) === x(`\${color}`));

		$.assert(x => x(atResult(3, 3, 1, 2)) === x(`: `));

		$.assert(x => x(atResult(3, 3, 1, 3, 0)) === x(`\${color}`));

		$.assert(x => x(atResult(3, 3, 1, 4)) === x(`;
	\``));

		$.assert(x => x(atResult(3, 3, 2)) === x(`)}`));

		$.assert(x => x(atResult(3, 4)) === x(`
}
\``));

		$.assert(x => x(atResult(4)) === x(`;
`));
	}),
);
