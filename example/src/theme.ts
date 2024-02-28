import { CssTheme } from '@robertakarobin/util/css/theme.ts';

const breakpoints = {
	phone: 600,
	tablet: 1000,
};

const constants = {
	fontBase_family: `monospace`,
	fontBase_size: 24,
};

const fonts = {
	wingdings: {
		name: `myCustomFont`,
		src: `/assets/Wingdings 3.ttf`,
		weight: 400,
	},
} as const;

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

export const theme = new CssTheme({
	bps: breakpoints,
	fonts,
	types: typefaces,
	val: constants,
});

export const { bp, types, val, vars } = theme;
