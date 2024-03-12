import { Component, css, html } from '@robertakarobin/util/components/component.ts';
import { ModalContainer } from '@robertakarobin/util/components/modal-container.ts';
import { ProgressCircle } from '@robertakarobin/util/components/progress-circle.ts';

const style = css`
:host {
	& circle {
		stroke: #ff0000;
		transition: stroke-dasharray 10s;
	}
}
`;

@Component.define({ style })
export class ProgressModal extends Component {
	static style = style;

	connectedCallback() {
		super.connectedCallback();

		const $circle = this.findDown(ProgressCircle);
		const statusChanged = this.findUp(ModalContainer).attribute(`status`);
		this.subscribe(statusChanged, ({ value }) => {
			switch (value) {
				case `activating`:
					$circle.style.transition = `none`; // Force circle to reset without tweening
					$circle.set({ value: 100 });
					break;
				case `active`:
					$circle.style.removeProperty(`transition`); // Undo the `style.transition = none`
					$circle.set({ value: 0 });
					break;
			}
		});
	}

	dismiss() {
		void this.findUp(ModalContainer).close();
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
