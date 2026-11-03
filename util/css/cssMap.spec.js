import { test } from '../spec/index.js';

import { CssBlock } from './cssMap.js';

/**
 * @typedef {{
 * display: 'block' | 'inline' | 'none';
 * content?: string;
 * }} CssMapSubject
 */

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(`${new CssBlock()}`) === ``);

	let subject = CssBlock.from(/** @type {CssMapSubject} */({ display: `block` }));
	$.assert(x => x(`${subject}`) === `display: block;`);
	$.assert(x => x(subject.display) === `block`);
	$.assert(x => x(Object.keys(subject).join(` `)) === `display`);

	subject.display = `none`;
	$.assert(x => x(`${subject}`) === `display: none;`);
	$.assert(x => x(subject.display) === `none`);
	$.assert(x => x(Object.keys(subject).join(` `)) === `display`);

	subject.content = `"foo"`;
	$.assert(x => x(`${subject}`) === `content: "foo";\ndisplay: none;`); // Note alphabetical
	$.assert(x => x(subject.content) === `"foo"`);
	$.assert(x => x(Object.keys(subject).join(` `)) === `display content`);
});
