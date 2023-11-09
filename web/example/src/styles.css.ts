import { css, theme } from './styles/shared.ts';

export default `
* {
	${theme.reset}
}

:root {
	${theme.setCssVals()}

	font-family: ${css.fontBase_family};
	font-size: calc(${css.fontBase_size} * 1px);
}
`;