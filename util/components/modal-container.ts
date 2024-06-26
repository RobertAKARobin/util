import { Component } from './component.ts';
import { enumy } from '../group/enumy.ts';
import { sleep } from '../time/sleep.ts';

export const defaultDuration = .2;
export const durationVarName = `--modalContainerDuration`;
export const modalStatusAttr = `data-modal-status`;
export const modalStatus = enumy(
	`activating`,
	`active`,
	`inactivating`,
	`inactive`,
);
export type ModalStatus = keyof typeof modalStatus;

/**
 * A container into which modal content can be injected with `.place()`. It's abstract so that it can be subclassed.
 * Each application will presumably need only one, since you only generally only want one dialog to show at a time.
 */
export abstract class BaseModalContainer extends Component.custom(`dialog`) {
	duration = defaultDuration;

	@Component.attribute({ name: modalStatusAttr }) status: ModalStatus = `inactive`;

	constructor() {
		super();
		this.addEventListener(`close`, () => {
			this.status = `inactive`;
		});
	}

	async close() {
		if (this.status !== `active`) {
			return;
		}

		this.status = `inactivating`;
		await sleep(this.duration * 1000); // TODO3: Tried awaiting transtionend but got very inconsistent results
		this.status = `inactive`;
		super.close();
		return this;
	}

	connectedCallback() {
		super.connectedCallback();
		this.style.setProperty(durationVarName, `${this.duration}s`);
	}

	place(...children: Array<Node>) {
		this.replaceChildren(...children);
		return this;
	}

	async show() {
		if (this.status !== `inactive`) {
			return;
		}

		super.showModal();
		this.status = `activating`;
		await sleep(this.duration * 1000);
		this.status = `active`;
		return this;
	}

	showModal() {
		return this.show();
	}
}

/**
 * @see {@link BaseModalContainer}
 */
@Component.define({
	stylePath: import.meta.url,
})
export class ModalContainer extends BaseModalContainer {}
