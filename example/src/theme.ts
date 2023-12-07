import { CssTheme } from '@robertakarobin/util/theme.ts';

const breakpoints = {
	phone: 600,
	tablet: 1000,
};

const constants = {
	fontBase_family: `monospace`,
	fontBase_size: 24,
};

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
};

export const theme = new CssTheme({
	bps: breakpoints,
	types: typefaces,
	val: constants,
});

export const { bp, types, val, vars } = theme;
