import { Transition } from '@robertakarobin/util/transition.ts';

import { Component, type ComponentInstance } from '../component.ts';

export class ModalContainer extends Component(`div`, {
	'data-duration': 0.2,
}) {
	static {
		this.init();
	}

	transition!: Transition;

	clear() {
		this.transition.inactivate();
	}

	onEl() {
		this.transition = new Transition({
			$target: this,
			duration: parseInt(this.get(`data-duration`)),
			status: `inactive`,
		});

		this.transition.subscribe(({ status }) => {
			if (status === `inactivate`) {
				this.replaceChildren();
			}
		});

		this.style.display = `none`;
	}

	place(modal: ComponentInstance) {
		this.replaceChildren(modal);
		this.transition.activate();
	}

	template = () => `<div></div>`;
}
