import { $transitionStateAttr, Transition, transitionStatus } from '../transition.ts';
import { Component } from '../component.ts';

export const defaultDuration = 0.2;
const durationVarName = `--modalContainerDuration`;

export const modalContainerDefaultStyles = /*css*/`
align-items: center;
background: transparent;
border: 0;
display: flex;
flex-direction: column;
height: 100%;
justify-content: center;
padding: 0;
width: 100%;

&::backdrop {
	backdrop-filter: blur(5px);
	background: #000000b0;
}

&,
&::backdrop {
	opacity: 0;
	transition: opacity var(${durationVarName}) linear;
}

&[${$transitionStateAttr}='${transitionStatus.inactive}'] {
	display: none;
}

&[${$transitionStateAttr}='${transitionStatus.activating}'],
&[${$transitionStateAttr}='${transitionStatus.active}'] {
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
	transition: Transition;

	constructor() {
		super();

		this.transition = new Transition({
			$target: this,
			duration: this.duration,
			status: `inactive`,
		}, {
			emitOnInit: true,
		});
	}

	close() {
		if (this.transition.isActive) {
			this.transition.inactivate();
		}
		return this;
	}

	connectedCallback() {
		this.transition.subscribe(({ status }) => {
			if (status === `inactive`) {
				super.close();
			}
		});
	}

	place(...children: Array<Node>) {
		this.replaceChildren(...children);
		return this;
	}

	show() {
		const style = document.createElement(`style`);
		style.innerHTML = `${this.Ctor.selector}, ${this.Ctor.selector}::backdrop { ${durationVarName}: ${this.duration}s }`;
		this.appendChild(style);

		super.showModal();
		this.transition.activate();
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
