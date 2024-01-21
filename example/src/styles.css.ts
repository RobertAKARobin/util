import { $transitionStateAttr, transitionStatus } from '@robertakarobin/util/transition.ts';
import { ModalContainer } from '@robertakarobin/util/components/modal-container.ts';

import { bp, theme, types } from '@src/theme.ts';

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

${ModalContainer.selector} {
	align-items: center;
	backdrop-filter: blur(5px);
	background: #000000c0;
	display: flex;
	height: 100%;
	justify-content: center;
	left: 0;
	opacity: 0;
	position: fixed;
	top: 0;
	transition: opacity ${ModalContainer.defaultDuration}s linear;
	width: 100%;

	&[${$transitionStateAttr}='${transitionStatus.inactive}'] {
		display: none;
	}

	&[${$transitionStateAttr}='${transitionStatus.activating}'],
	&[${$transitionStateAttr}='${transitionStatus.active}'] {
		opacity: 1;
	}
}
`;
