import { test } from '../spec/index.ts';

import { updateQuerystring } from './querystring.ts';

export const spec = test(import.meta.url, $ => {
	let href: string;

	$.log(() => href = `https://example.com`);
	$.assert(x => x(updateQuerystring(href, {})) === x(`https://example.com/`));

	$.log(() => href = `https://example.com?foo=bar`);
	$.assert(x => x(updateQuerystring(href, {})) === x(`https://example.com/?foo=bar`));

	$.log(() => href = `https://example.com?foo=bar`);
	$.assert(x => x(updateQuerystring(href, { foo: `steve` })) === x(`https://example.com/?foo=steve`));

	$.log(() => href = `https://example.com?foo=bar`);
	$.assert(x => x(updateQuerystring(href, { boo: `far` })) === x(`https://example.com/?foo=bar&boo=far`));
});
