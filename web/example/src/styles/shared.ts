import { CssTheme } from '@robertakarobin/web/styles/lib.css.ts';

export const constants = {
	fontBase_family: `monospace`,
	fontBase_size: 24,
};

export const theme = new CssTheme(constants);

export const { css, val } = theme;
