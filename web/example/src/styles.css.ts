import { bp, theme, types } from './theme.ts';

export default `
:root {
	${theme.varsDeclarations}

	${types.body}
}

${theme.typeClasses}

h1 {
	${theme.types.h1}

	@media ${bp.moreThan.phone} and ${bp.lessThan.tablet} {
		color: orange !important;
	}
}

*:target {
	outline: 1px solid red;
}
`;
