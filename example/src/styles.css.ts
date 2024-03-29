import { bp, theme, types } from '@src/theme.ts';
import { css } from '@robertakarobin/util/css/theme.ts';

export default css`
:root {
	${theme.varsDeclarations}

	${types.body}
}

${theme.fontFaces}
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
