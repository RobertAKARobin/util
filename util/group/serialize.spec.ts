/* eslint-disable @stylistic/quote-props */
import { test } from '../spec/index.ts';

import { serialize } from './serialize.ts';

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(serialize({ foo: `bar` })) === `{foo:'bar'}`);
	$.assert(x => x(serialize({ foo: 32 })) === `{foo:32}`);
	$.assert(x => x(serialize({ foo: true })) === `{foo:true}`);
	$.assert(x => x(serialize({ foo: null })) === `{foo:null}`);
	$.assert(x => x(serialize({ foo: undefined })) === `{}`);
	$.assert(x => x(serialize([`foo`, 32])) === `['foo',32]`);
	$.assert(x => x(serialize({ '32': `foo` })) === `{'32':'foo'}`);
	$.assert(x => x(serialize({ '-32': `foo` })) === `{'-32':'foo'}`);
	$.assert(x => x(serialize({ '$32': `foo` })) === `{$32:'foo'}`);
});
