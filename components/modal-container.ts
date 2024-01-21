import { Component } from '../component.ts';
import { Transition } from '../transition.ts';

@Component.define()
export class ModalContainer extends Component.custom(`div`) {
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
