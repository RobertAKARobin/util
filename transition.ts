import { Emitter } from './emitter.ts';
import { enumy } from './enumy.ts';
import { repaint } from './repaint.ts';
import { sleep } from './sleep.ts';

export const transitionStatuses = [
	`activate`,
	`activating`,
	`active`,
	`inactivate`,
	`inactivating`, // if 'deactive' was a word I would have used that instead
	`inactive`,
] as const;

export const transitionStatus = enumy(...transitionStatuses);

export type TransitionStatus = typeof transitionStatuses[number];

export const $transitionStateAttr = `data-transition-state`;

type TransitionState = {
	$target?: HTMLElement;
	duration: number;
	status: TransitionStatus;
};

export class Transition extends Emitter<TransitionState> {
	static readonly $stateAttr = $transitionStateAttr;
	static readonly status = transitionStatus;
	static readonly statuses = transitionStatuses;

	activate() {
		this.patch({ status: `activate` });
	}

	inactivate() {
		this.patch({ status: `inactivate` });
	}

	async onChange(
		update: TransitionState,
		{ previous }: { previous: TransitionState; }
	) {
		if (this.$.$target !== undefined) {
			this.$.$target.setAttribute(Transition.$stateAttr, update.status);
		}

		if (update.status === previous.status) {
			return;
		}

		switch (update.status) {
			case `activate`:
				repaint();
				this.patch({ status: `activating` });
				break;
			case `activating`:
				await sleep(this.$.duration * 1000);
				this.patch({ status: `active` });
				break;
			case `inactivate`:
				repaint();
				this.patch({ status: `inactivating` });
				break;
			case `inactivating`:
				await sleep(this.$.duration * 1000);
				this.patch({ status: `inactive` });
				break;
		}
	}
}
