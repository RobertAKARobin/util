import { test } from '../spec/index.js';

import { CssTheme } from './theme.js';

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

export const spec = test(import.meta.url, $ => {
	const theme = new CssTheme({
		bps: breakpoints,
		fonts,
		types: typefaces,
		val: constants,
	});

	$.assert(x => x(theme.reset.length) === 251);

	$.assert(x => x(theme.fonts.wingdings.name) === `myWingdings`);
	$.assert(x => x(theme.fontFaces) === `@font-face {

	font-family: comic;


	src: url('/myComic.ttf');
}
@font-face {

	font-family: wingdings;

	font-weight: 400;
	src: url('/assets/myWingdings.ttf');
}`);
});
