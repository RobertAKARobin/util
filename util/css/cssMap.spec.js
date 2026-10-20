import { test } from '../spec/index.js';

import { cssMap, cssMapFactory, cssMapToString } from './cssMap.js';

/**
 * @typedef {{
 * display: 'block' | 'inline' | 'none';
 * content?: string;
 * }} CssMapSubject
 */

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(`${cssMap({})}`) === ``);

	let subject = cssMap(/** @type {CssMapSubject} */({ display: `block` }));
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

	const custom = cssMapFactory(/** @type {CssMapSubject} */({ content: `"default"` }), source =>
		`custom {${cssMapToString(source)}}`,
	);
	subject = custom({ display: `inline` });
	$.assert(x => x(`${subject}`) === `custom {content: "default";\ndisplay: inline;}`);
	$.assert(x => x(subject.content) === `"default"`);
	$.assert(x => x(Object.keys(subject).join(` `)) === `content display`); // Note order reflects insertion
});

