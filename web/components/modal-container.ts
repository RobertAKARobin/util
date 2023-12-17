import { enumy } from '@robertakarobin/util/enumy.ts';
import { repaint } from '@robertakarobin/util/repaint.ts';
import { sleep } from '@robertakarobin/util/sleep.ts';

import { Component } from '../component.ts';

const modalStatuses = enumy(
	`entering`,
	`active`,
	`exiting`,
	`inactive`,
);

const statusAttribute = `data-modal`;

export type ModalState = {
	modal?: Component<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
	status: keyof typeof modalStatuses;
	transitionDuration: number;
};

export class ModalContainer extends Component<ModalState> {
	static transitionDurationDefault = .2;

	static {
		this.init();
	}

	constructor(id?: string, initial: Partial<ModalState> = {}) {
		super(undefined, {
			modal: undefined,
			status: `inactive`,
			transitionDuration: ModalContainer.transitionDurationDefault,
			...initial,
		});
	}

	clear() {
		this.patch({
			modal: undefined,
			status: `exiting`,
		});
	}

	async onChange(update: ModalState, { previous }: { previous: ModalState; }) {
		if (update?.modal === previous?.modal && update?.status === previous?.status
		) {
			return;
		}

		if (update?.modal !== undefined && update?.status === `entering`) {
			this.$el.style.removeProperty(`display`);
			repaint();
			this.$el.setAttribute(statusAttribute, update.status);
			this.$el.replaceChildren(update.modal.render());
			this.patch({ status: `active` });
			update.modal.actions.placed();

		} else if (update?.status === `exiting`) {
			this.$el.setAttribute(statusAttribute, update.status);
			await sleep(this.value.transitionDuration * 1000);
			this.$el.style.display = `none`;
			this.$el.replaceChildren();
			this.patch({
				modal: undefined,
				status: `inactive`,
			});

		} else if (update?.status !== undefined) {
			this.$el?.setAttribute(statusAttribute, update.status);
		}
	}

	place(modal: Component<any>) { // eslint-disable-line @typescript-eslint/no-explicit-any
		this.patch({
			modal,
			status: `entering`,
		});
	}

	template = () => `
<div
	is="modal-container"
	style="display:none"
></div>`; // Using `[style]` because the code above toggles the style attribute, as opposed to the styles in the stylesheet
}
