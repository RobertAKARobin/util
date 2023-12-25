import { Transition } from '@robertakarobin/util/transition.ts';

import { ComponentFactory, type ComponentInstance } from '../component.ts';

const defaultDuration = .2;

export class ModalContainer extends ComponentFactory(`div`, {
	'data-duration': defaultDuration,
}) {
	static defaultDuration = defaultDuration;

	static {
		this.init();
	}

	transition!: Transition;

	constructor() {
		super();

		this.transition = new Transition({
			$target: this,
			duration: parseFloat(this.get(`data-duration`)),
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

	place(modal: ComponentInstance) {
		const $content = modal.render();
		this.replaceChildren($content);
		this.transition.activate();
	}
}
