import { suite, test } from '../spec/index.js';

import {
	CssBreakpoints,
	CssFontface,
	CssFontfaces,
	cssReset,
	CssTypeface,
	CssTypefaces,
	CssVariable,
	CssVariables,
} from './theme.js';

export const spec = suite(import.meta.url, {},
	test(`CssBreakpoints`, $ => {
		let subject = CssBreakpoints.from({
			phone: 600,
			tablet: 1000,
		});

		$.assert(x => x(subject.lessThan(`phone`)) === `(width < 600)`);
		$.assert(x => x(subject.moreThan(`phone`)) === `(width >= 600)`);
		$.assert(x => x(subject.lessThan(`tablet`)) === `(width < 1000)`);
		$.assert(x => x(subject.moreThan(`tablet`)) === `(width >= 1000)`);

		subject.tablet = 2000;

		$.assert(x => x(subject.moreThan(`tablet`)) === `(width >= 2000)`);
	}),

	test(`CssFontface`, $ => {
		$.assert(x => x(`${new CssFontface()}`) === ``);

		let subject = CssFontface.from({ display: `block` });
		$.assert(x => x(`${subject}`) === `font-display: block;`);

		subject.display = `optional`;
		subject.src = `/foo.ttf`;
		$.assert(x => x(`${subject}`) === `font-display: optional;
src: url('/foo.ttf');`);
	}),

	test(`CssFontfaces`, $ => {
		$.assert(x => x(`${new CssFontfaces()}`) === ``);

		let subject = CssFontfaces.from({
			comic: {},
			wingdings: {
				family: `myWingdings`,
				src: `/assets/myWingdings.ttf`,
				weight: 400,
			},
		});

		$.assert(x => x(`${subject.comic}`) === `font-family: comic;`);

		subject.comic.src = `/assets/myComic.ttf`;

		$.assert(x => x(`${subject}`) === `@font-face {
font-family: comic;
src: url('/assets/myComic.ttf');
}
@font-face {
font-family: myWingdings;
font-weight: 400;
src: url('/assets/myWingdings.ttf');
}`);
	}),

	test(`CssTypeface`, $ => {
		$.assert(x => x(`${new CssTypeface()}`) === ``);

		let subject = CssTypeface.from({
			'color': `red`,
			'font-weight': `bold`,
		});

		$.assert(x => x(`${subject}`) === `color: red;
font-weight: bold;`);

		subject.color = ``;

		$.assert(x => x(`${subject}`) === `font-weight: bold;`);

		subject.name = `myType`;

		$.assert(x => x(`${subject}`) === `--typeface-name: myType;
font-weight: bold;`);
	}),

	test(`CssTypefaces`, $ => {
		$.assert(x => x(`${new CssTypefaces()}`) === ``);

		let subject = CssTypefaces.from({
			body: {
				'font-family': `monospace`,
				'font-size': 24, // For units see ./cssUnit
			},
			h1: {
				color: `darkgreen`,
				name: `myH1`,
			},
		});

		$.assert(x => x(`${subject}`) === /*css*/`.type-body {
--typeface-name: type-body;
font-family: monospace;
font-size: 24;
}
.myH1 {
--typeface-name: myH1;
color: darkgreen;
}`);

		// @ts-expect-error `delete` should only be used on optional properties
		delete subject.h1;

		subject.body.name = `myBody`;
		$.assert(x => x(`${subject}`) === /*css*/`.myBody {
--typeface-name: myBody;
font-family: monospace;
font-size: 24;
}`);
	}),

	test(`CssVariable`, $ => {
		const subject = new CssVariable(`name-first`, `Alice`);

		$.assert(x => x(`${subject}`) === `var(--name-first)`);
		$.assert(x => x(subject.varName) === `--name-first`);
		$.assert(x => x(subject.value) === `Alice`);
		$.assert(x => x(subject.toDeclaration()) === `--name-first: Alice;`);

		subject.name = `moniker`;
		subject.value = `Bob`;
		$.assert(x => x(`${subject}`) === `var(--moniker)`);
		$.assert(x => x(subject.varName) === `--moniker`);
		$.assert(x => x(subject.value) === `Bob`);
		$.assert(x => x(subject.toDeclaration()) === `--moniker: Bob;`);
	}),

	test(`CssVariables`, $ => {
		$.assert(x => x(`${new CssVariables()}`) === ``);

		let subject = CssVariables.from({
			age: 42,
			name: `Alice`,
		});

		$.assert(x => x(`${subject}`) === `--age: 42;
--name: Alice;`);

		subject.name.name = `name-first`;
		$.assert(x => x(`${subject}`) === `--age: 42;
--name-first: Alice;`);

		// @ts-expect-error `delete` should only be used on optional properties
		delete subject.name;
		subject.age.value = Infinity;

		$.assert(x => x(`${subject}`) === `--age: Infinity;`);
	}),

	test(`cssReset`, $ => {
		$.assert(x => x(cssReset.length) === 251);
	}),
);
