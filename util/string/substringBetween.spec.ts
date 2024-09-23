import { test } from '../spec/index.ts';

import { substringBetween } from './substringBetween.ts';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(substringBetween(`foobarbaz`, { begin: /foo/, end: /baz/ })) === `bar`);
	$.assert(x => x(substringBetween(`foobarbaz`, { begin: /foo/ })) === `barbaz`);
	$.assert(x => x(substringBetween(`foobarbaz`, { end: /baz/ })) === `foobar`);
	$.assert(x => x(substringBetween(`foobarbaz`)) === `foobarbaz`);

	$.assert(x => x(substringBetween(`foobarbaz`, { begin: /zzz/, end: /zzz/ })) === null);
	$.assert(x => x(substringBetween(`foobarbaz`, { begin: /zzz/ })) === null);
	$.assert(x => x(substringBetween(`foobarbaz`, { end: /zzz/ })) === null);
});
