import { CssTheme } from '@robertakarobin/web/theme.ts';

const breakpoints = {
	phone: 600,
	tablet: 1000,
};

const constants = {
	fontBase_family: `monospace`,
	fontBase_size: 24,
};

const typefaces = {
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

export const { bp, val, vars } = theme;
