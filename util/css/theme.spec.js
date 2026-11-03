import { suite, test } from '../spec/index.js';

import { CssFontface, CssFontfaces, CssTheme } from './theme.js';

const breakpoints = {
	phone: 600,
	tablet: 1000,
};

const constants = {
	fontBase_family: `monospace`,
	fontBase_size: 24,
};

const fonts = /** @type {const} */({
	comic: {
		name: `myComic`,
		src: `/myComic.ttf`,
	},
	wingdings: {
		name: `myWingdings`,
		src: `/assets/myWingdings.ttf`,
		weight: 400,
	},
});

const typefaces = {
	body: `
		font-family: ${constants.fontBase_family};
		font-size: ${constants.fontBase_size}px;
	`,
	h1: `
		color: darkgreen;
	`,
	h2: `
		color: blue;
	`,
	wtf: `
		font-family: ${fonts.wingdings.name};
	`,
};

export const spec = suite(import.meta.url, {},
	test(`reset`, $ => {
		const theme = new CssTheme({
			bps: breakpoints,
			fonts,
			types: typefaces,
			val: constants,
		});

		$.assert(x => x(theme.reset.length) === 251);
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
);
