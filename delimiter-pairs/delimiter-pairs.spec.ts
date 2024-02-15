import { test } from '../spec/index.ts';

import { stringMates as mates, type TagResult } from './delimiter-pairs.ts';

const tagA = [`<a>`, `</a>`];
const tag1 = [`<1>`, `</1>`];
const tag2 = [`<2>`, `</2>`];

export const spec = test(`stringMates`, $ => {
	let result: ReturnType<typeof mates>;
	$.log(() => result = mates(`abcdef`));
	$.assert(x => Array.isArray(x(result)));
	$.assert(x => x(result.length) === 1);
	$.assert(x => x(result.length) === 1);

	$.log(() => result = mates(`abc</a>de`, [tagA]));
	$.assert(x => x(result.length) === 1);
	$.assert(x => x(result[0]) === `abc</a>de`);

	$.log(() => result = mates(`abc<a>de`, [tagA]));
	$.assert(x => x(result.length) === 1);
	$.assert(x => x(result[0]) === `abc<a>de`);

	$.log(() => result = mates(`a<a>bcd</a>e`, [tagA]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).tags) === x(tagA));
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bcd`);
	$.assert(x => x(result[2]) === `e`);

	$.log(() => result = mates(`a<a>bc</a>d</a>e`, [tagA]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bc`);
	$.assert(x => x(result[2]) === `d</a>e`);

	$.log(() => result = mates(`a<a>bc<a>d</a>e`, [tagA]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bc<a>d`);
	$.assert(x => x(result[2]) === `e`);

	$.log(() => result = mates(`a<a>bb<a>ccc</a>dddd</a>eeeee`, [tagA]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bb`);
	$.assert(x => x(((result[1] as TagResult).contents[1] as TagResult).contents[0]) === `ccc`);
	$.assert(x => x((result[1] as TagResult).contents[2]) === `dddd`);
	$.assert(x => x(result[2]) === `eeeee`);

	$.log(() => result = mates(`a<a>bb</a>ccc</a>dddd</a>eeeee`, [tagA]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bb`);
	$.assert(x => x(result[2]) === `ccc</a>dddd</a>eeeee`);

	$.log(() => result = mates(`a<a>bb</a>ccc<a>dddd</a>eeeee`, [tagA]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bb`);
	$.assert(x => x(result[2]) === `ccc`);
	$.assert(x => x((result[3] as TagResult).contents[0]) === `dddd`);
	$.assert(x => x(result[4]) === `eeeee`);

	$.log(() => result = mates(`a<a>bb<a>ccc<a>dddd</a>eeeee`, [tagA]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bb<a>ccc<a>dddd`);
	$.assert(x => x(result[2]) === `eeeee`);

	$.log(() => result = mates(`a<1>bb<2>ccc</2>dddd</1>eeeee`, [tag1]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bb<2>ccc</2>dddd`);

	$.log(() => result = mates(`a<1>bb<2>ccc</2>dddd</1>eeeee`, [tag1, tag2]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bb`);
	$.assert(x => x((result[1] as TagResult).tags) === tag1);
	$.assert(x => x(((result[1] as TagResult).contents[1] as TagResult).contents[0]) === `ccc`);
	$.assert(x => x(((result[1] as TagResult).contents[1] as TagResult).tags) === tag2);

	$.log(() => result = mates(`a<1>bb<2>ccc</1>dddd</2>eeeee`, [tag1, tag2]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bb<2>ccc`);
});
