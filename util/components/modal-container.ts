import { Component } from './component.ts';
import { enumy } from '../enumy.ts';
import { listenOnce } from '../listenOnce.ts';

export const defaultDuration = .2;
const durationVarName = `--modalContainerDuration`;
const modalStatusAttr = `data-modal-status`;
export const modalStatus = enumy(
	`activating`,
	`active`,
	`inactivating`,
	`inactive`
);
export type ModalStatus = keyof typeof modalStatus;

export const modalContainerDefaultStyles = /*css*/`
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
`;

/**
 * A container into which modal content can be injected with `.place()`. It's abstract so that it can be subclassed.
 * Each application will presumably need only one, since you only generally only want one dialog to show at a time.
 */
export abstract class BaseModalContainer extends Component.custom(`dialog`) {
	clearOnClose = false;
	duration = defaultDuration;

	@Component.attribute({ name: modalStatusAttr }) status: ModalStatus = `inactive`;

	constructor() {
		super();
		this.addEventListener(`close`, () => {
			this.status = `inactive`;
		});
	}

	async close() {
		if (this.status !== `active`) {
			return;
		}

		this.status = `inactivating`;
		await listenOnce(this, `transitionend`);
		this.status = `inactive`;
		super.close();
		return this;
	}

	connectedCallback() {
		super.connectedCallback();
		this.style.setProperty(durationVarName, `${this.duration}s`);
	}

	place(...children: Array<Node>) {
		this.replaceChildren(...children);
		return this;
	}

	async show() {
		if (this.status !== `inactive`) {
			return;
		}

		super.showModal();
		this.status = `activating`;
		await listenOnce(this, `transitionend`);
		this.status = `active`;
		return this;
	}

	showModal() {
		return this.show();
	}
}

const style = /*css*/`
:host {
	${modalContainerDefaultStyles}
}
`;
/**
 * @see {@link BaseModalContainer}
 */
@Component.define({ style })
export class ModalContainer extends BaseModalContainer {}
