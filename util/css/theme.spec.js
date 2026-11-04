import { suite, test } from '../spec/index.js';

import { CssFontface, CssFontfaces, CssTypeface, CssTypefaces } from './theme.js';

// const breakpoints = {
// 	phone: 600,
// 	tablet: 1000,
// };

// const constants = {
// 	fontBase_family: `monospace`,
// 	fontBase_size: 24,
// };

export const spec = suite(import.meta.url, {},
	// test(`reset`, $ => {
	// 	const theme = new CssTheme({
	// 		bps: breakpoints,
	// 		fonts,
	// 		types: typefaces,
	// 		val: constants,
	// 	});

	// 	$.assert(x => x(theme.reset.length) === 251);
	// }),


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
				'font-size': 24,
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
);
