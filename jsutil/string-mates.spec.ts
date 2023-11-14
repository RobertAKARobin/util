import { test } from '@robertakarobin/spec';

import { stringMates as mates, type TagResult } from './string-mates.ts';

const aTags = [`<a>`, `</a>`];

export const spec = test(`stringMates`, $ => {
	let result: ReturnType<typeof mates>;
	$.log(() => result = mates(`abcdef`));
	$.assert(x => Array.isArray(x(result)));
	$.assert(x => x(result.length) === 1);
	$.assert(x => x(result.length) === 1);

	$.log(() => result = mates(`abc</a>de`, [aTags]));
	$.assert(x => x(result.length) === 1);
	$.assert(x => x(result[0]) === `abc</a>de`);

	$.log(() => result = mates(`abc<a>de`, [aTags]));
	$.assert(x => x(result.length) === 1);
	$.assert(x => x(result[0]) === `abc<a>de`);

	$.log(() => result = mates(`a<a>bcd</a>e`, [aTags]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bcd`);
	$.assert(x => x(result[2]) === `e`);

	$.log(() => result = mates(`a<a>bc</a>d</a>e`, [aTags]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bc`);
	$.assert(x => x(result[2]) === `d</a>e`);

	$.log(() => result = mates(`a<a>bc<a>d</a>e`, [aTags]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bc<a>d`);
	$.assert(x => x(result[2]) === `e`);

	$.log(() => result = mates(`a<a>bb<a>ccc</a>dddd</a>eeeee`, [aTags]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bb`);
	$.assert(x => x(((result[1] as TagResult).contents[1] as TagResult).contents[0]) === `ccc`);
	$.assert(x => x((result[1] as TagResult).contents[2]) === `dddd`);
	$.assert(x => x(result[2]) === `eeeee`);

	$.log(() => result = mates(`a<a>bb</a>ccc</a>dddd</a>eeeee`, [aTags]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bb`);
	$.assert(x => x(result[2]) === `ccc</a>dddd</a>eeeee`);

	$.log(() => result = mates(`a<a>bb</a>ccc<a>dddd</a>eeeee`, [aTags]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bb`);
	$.assert(x => x(result[2]) === `ccc`);
	$.assert(x => x((result[3] as TagResult).contents[0]) === `dddd`);
	$.assert(x => x(result[4]) === `eeeee`);

	$.log(() => result = mates(`a<a>bb<a>ccc<a>dddd</a>eeeee`, [aTags]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bb<a>ccc<a>dddd`);
	$.assert(x => x(result[2]) === `eeeee`);

	$.log(() => result = mates(`a<1>bb<2>ccc</2>dddd</1>eeeee`, [[`<1>`, `</1>`]]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bb<2>ccc</2>dddd`);

	$.log(() => result = mates(`a<1>bb<2>ccc</2>dddd</1>eeeee`, [[`<1>`, `</1>`], [`<2>`, `</2>`]]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bb`);
	$.assert(x => x(((result[1] as TagResult).contents[1] as TagResult).contents[0]) === `ccc`);

	$.log(() => result = mates(`a<1>bb<2>ccc</1>dddd</2>eeeee`, [[`<1>`, `</1>`], [`<2>`, `</2>`]]));
	$.assert(x => x(result[0]) === `a`);
	$.assert(x => x((result[1] as TagResult).contents[0]) === `bb<2>ccc`);
});
