import { Component, html } from '@robertakarobin/util/components/component.ts';
import { ModalContainer } from '@robertakarobin/util/components/modal-container.ts';
import { ProgressCircle } from '@robertakarobin/util/components/progress-circle.ts';

@Component.define({
	stylePath: import.meta.url,
})
export class ProgressModal extends Component {
	readonly circle = this.findDown(ProgressCircle);
	readonly modal = this.findUp(ModalContainer);

	connectedCallback() {
		super.connectedCallback();

		this.modal().on(`status`, ({ detail }) => {
			switch (detail) {
				case `activating`:
					this.circle().style.transition = `none`; // Force circle to reset without tweening
					this.circle().set({ value: 100 });
					break;
				case `active`:
					this.circle().style.removeProperty(`transition`); // Undo the `style.transition = none`
					this.circle().set({ value: 0 });
					break;
			}
		});
	}

	dismiss() {
		void this.modal().close();
	}

	template = () => html`
${new ProgressCircle().set({
	borderWidth: 10,
	diameter: 300,
	max: 100,
	min: 0,
	value: 50,
}).write(`foo`)}

<button
	${this.on(`click`, `dismiss`)}
	type="button"
>Dismiss</button>
	`;
}
