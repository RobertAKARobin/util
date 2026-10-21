import { test } from '../spec/index.js';

import { CssMap } from './cssMap.js';

/**
 * @typedef {{
 * display: 'block' | 'inline' | 'none';
 * content?: string;
 * }} CssMapSubject
 */

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(`${new CssMap({})}`) === ``);

	let subject = new CssMap(/** @type {CssMapSubject} */({ display: `block` }));
	$.assert(x => x(`${subject}`) === `display: block;`);
	$.assert(x => x(subject.source.display) === `block`);
	$.assert(x => x(Object.keys(subject.source).join(` `)) === `display`);

	subject.source.display = `none`;
	$.assert(x => x(`${subject}`) === `display: none;`);
	$.assert(x => x(subject.source.display) === `none`);
	$.assert(x => x(Object.keys(subject.source).join(` `)) === `display`);

	subject.source.content = `"foo"`;
	$.assert(x => x(`${subject}`) === `content: "foo";\ndisplay: none;`); // Note alphabetical
	$.assert(x => x(subject.source.content) === `"foo"`);
	$.assert(x => x(Object.keys(subject.source).join(` `)) === `display content`);
});

