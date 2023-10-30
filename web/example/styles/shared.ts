import { CssTheme } from '@robertakarobin/web/styles/lib.css.ts';

export const constants = {
	fontBase_family: `Georgia, serif`,
	fontBase_size: 16,
};

export const theme = new CssTheme(constants);

export const { css, val } = theme;
