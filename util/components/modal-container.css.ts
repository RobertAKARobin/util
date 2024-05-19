import { durationVarName, modalStatus, modalStatusAttr } from './modal-container.ts';

export default /*css*/`
:host {
	align-items: center;
	background: transparent;
	border: 0;
	flex-direction: column;
	height: 100%;
	justify-content: center;
	max-height: none;
	max-width: none;
	padding: 0;
	width: 100%;

	&::backdrop {
		backdrop-filter: blur(5px);
		background: #000000b0;
	}

	&,
	&::backdrop {
		transition: opacity var(${durationVarName}) linear;
	}

	&[open] {
		display: flex;
	}

	&[${modalStatusAttr}='${modalStatus.inactivating}'],
	&[${modalStatusAttr}='${modalStatus.inactive}'] {
		&,
		&::backdrop {
			opacity: 0;
		}
	}

	&[${modalStatusAttr}='${modalStatus.activating}'],
	&[${modalStatusAttr}='${modalStatus.active}'] {
		&,
		&::backdrop {
			opacity: 1;
		}
	}
}
`;
