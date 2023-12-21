import { Transition } from '@robertakarobin/util/transition.ts';

import { Component, type ComponentInstance } from '../component.ts';

export class ModalContainer extends Component(`div`) {
	static transitionDurationDefault = 0.2;

	static {
		this.init();
	}

	readonly transition: Transition;

	constructor(
		id: ModalContainer[`id`],
		duration?: Transition[`value`][`duration`]
	) {
		super(id);

		this.transition = new Transition({
			$target: this,
			duration: duration ?? ModalContainer.transitionDurationDefault,
			status: `inactive`,
		});

		this.transition.subscribe(({ status }) => {
			if (status === `inactivate`) {
				this.replaceChildren();
			}
		});
	}

	clear() {
		this.transition.inactivate();
	}

	place(modal: ComponentInstance) {
		this.replaceChildren(modal);
		this.transition.activate();
	}

	template = () => `<div></div>`;
}
