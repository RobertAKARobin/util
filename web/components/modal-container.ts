import { enumy } from '@robertakarobin/util/enumy.ts';
import { repaint } from '@robertakarobin/util/repaint.ts';
import { sleep } from '@robertakarobin/util/sleep.ts';

import { Component } from '../component.ts';

export const modalStatuses = enumy(
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

	constructor(id?: string, initial: Partial<ModalState> = {}) {
		super(undefined, {
			modal: undefined,
			status: `inactive`,
			transitionDuration: ModalContainer.transitionDurationDefault,
			...initial,
		});

		this.subscribe(async({ modal, status }, { previous }) => {
			if (modal === previous.modal && status === previous.status) {
				return;
			}

			if (modal !== undefined && status === `entering`) {
				this.$el!.style.removeProperty(`display`);
				repaint();
				this.$el?.setAttribute(statusAttribute, status);
				if (modal.$el === undefined) {
					modal.render();
				}
				this.$el!.replaceChildren(modal.$el!);
				modal.actions.rendered();
				this.patch({ status: `active` });

			} else if (status === `exiting`) {
				this.$el?.setAttribute(statusAttribute, status);
				await sleep(this.value.transitionDuration * 1000);
				this.patch({
					modal: undefined,
					status: `inactive`,
				});
				this.$el!.style.display = `none`;
				this.$el!.replaceChildren();

			} else {
				this.$el?.setAttribute(statusAttribute, status);
			}
		});
	}

	clear() {
		this.patch({
			modal: undefined,
			status: `exiting`,
		});
	}

	place(modal: Component<any>) { // eslint-disable-line @typescript-eslint/no-explicit-any
		this.patch({
			modal,
			status: `entering`,
		});
	}

	template = () => `<div style="display:none"></div>`; // Using `[style]` because the code above toggles the style attribute, as opposed to the styles in the stylesheet
}
