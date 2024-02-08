import { $transitionStateAttr, Transition, transitionStatus } from '../transition.ts';
import { Component } from '../component.ts';

export const defaultDuration = 0.2;
const durationVarName = `--modalContainerDuration`;

const style = /*css*/`
:host {
	align-items: center;
	background: transparent;
	border: 0;
	display: flex;
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

	&[${$transitionStateAttr}='${transitionStatus.activating}'],
	&[${$transitionStateAttr}='${transitionStatus.active}'] {
		&,
		&::backdrop {
			opacity: 1;
		}
	}
}
`;

/**
 * A container into which modal content can be injected with `.place()`. Each application will presumably need only one, since you only generally only want one dialog to show at a time.
 */
@Component.define({ style })
export class ModalContainer extends Component.custom(`dialog`) {
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

		this.transition.subscribe(({ status }) => {
			if (status === `inactive`) {
				this.replaceChildren();
				this.close();
			}
		});
	}

	clear() {
		this.transition.inactivate();
	}

	place(...contents: Array<Node>) {
		this.replaceChildren(...contents);

		const style = document.createElement(`style`);
		style.innerHTML = `${this.Ctor.selector}, ${this.Ctor.selector}::backdrop { ${durationVarName}: ${this.duration}s }`;
		this.appendChild(style);

		this.showModal();
		this.transition.activate();
	}
}
