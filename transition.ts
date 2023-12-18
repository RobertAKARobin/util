import { byIndex } from './byIndex.ts';
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

const activeStatuses = byIndex(
	transitionStatus.activate,
	transitionStatus.activating,
	transitionStatus.active,
);

const inactiveStatuses = byIndex(
	transitionStatus.inactivate,
	transitionStatus.inactivating,
	transitionStatus.inactive,
);

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

	get isActive() {
		return this.$.status in activeStatuses;
	}

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
		if (
			activeStatuses[update.status] - activeStatuses[previous.status] < 0 // If either is undefined, evaluates to NaN, and false
			|| inactiveStatuses[update.status] - inactiveStatuses[previous.status] < 0
		) {
			return;
		}

		if (this.$.$target !== undefined) {
			this.$.$target.setAttribute(Transition.$stateAttr, update.status);
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
