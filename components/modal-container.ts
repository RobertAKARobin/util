import { $transitionStateAttr, Transition, transitionStatus } from '../transition.ts';
import { Component } from '../component.ts';

@Component.define()
export class ModalContainer extends Component.custom(`div`) { // TODO2: Replace with `<dialog>`
	static defaultDuration = .2;

	@Component.attribute({
		name: `data-duration`,
	}) duration = ModalContainer.defaultDuration;
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
			}
		});
	}

	clear() {
		this.transition.inactivate();
	}

	place(modal: Component) {
		const $content = modal.render();
		this.replaceChildren($content);
		this.transition.activate();
	}
}

/**
 * Default styling for modal container. Not applying it in case the end-user wants something different.
 */
export const modalContainerDefaultStyle = /*css*/`
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
	z-index: 9999;

	&[${$transitionStateAttr}='${transitionStatus.inactive}'] {
		display: none;
	}

	&[${$transitionStateAttr}='${transitionStatus.activating}'],
	&[${$transitionStateAttr}='${transitionStatus.active}'] {
		opacity: 1;
	}
}
`;
