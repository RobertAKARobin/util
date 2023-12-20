import { Transition } from '@robertakarobin/util/transition.ts';

import { Component } from '../component.ts';

type ModalState = {
	modal: Component<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
	transitionDuration: number;
};

export class ModalContainer extends Component<ModalState> {
	static transitionDurationDefault = 0.2;

	static {
		this.init();
	}

	readonly transition: Transition;

	constructor(...[id, initial]: ConstructorParameters<typeof Component<ModalState>>) {
		super(id, initial);

		this.transition = new Transition({
			$target: initial?.modal.$el ?? undefined,
			duration: initial?.transitionDuration ?? ModalContainer.transitionDurationDefault,
			status: `inactive`,
		});

		this.transition.subscribe(({ status }) => {
			if (status === `inactivate`) {
				this.patch({ modal: undefined });
				this.$el.replaceChildren();
			}
		});
	}

	clear() {
		this.transition.inactivate();
	}

	onPlace() {
		this.transition.patch({ $target: this.$el });
	}

	place(modal: Component<any>) { // eslint-disable-line @typescript-eslint/no-explicit-any
		this.patch({ modal });
		this.$el.replaceChildren(modal.render());
		this.transition.activate();
		modal.onPlace();
	}

	template = () => `<div></div>`;
}
