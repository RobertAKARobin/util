import { theme, val } from './theme.ts';

export default `
:root {
	${theme.reset}
	${theme.varsDeclarations}

	font-family: ${val.fontBase_family};
	font-size: calc(${val.fontBase_size} * 1px);
}

${theme.typeClasses}

h1 {
	${theme.types.h1}
}
`;
