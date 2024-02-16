import { Component, css, html } from '@robertakarobin/util/component.ts';
import { ModalContainer } from '@robertakarobin/util/components/modal-container.ts';
import { ProgressCircle } from '@robertakarobin/util/components/progress-circle.ts';
import { repaint } from '@robertakarobin/util/repaint.ts';

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
		const $circle = this.findDown(ProgressCircle);
		this.findUp(ModalContainer).transition.subscribe(({ status }) => {
			switch (status) {
				case `activate`:
					$circle.style.transition = `none`; // Force circle to reset without tweening
					$circle.set({ value: 100 });
					break;
				case `activating`:
					$circle.style.removeProperty(`transition`); // Undo the `style.transition = none`
					repaint(); // Force browser to start tweening after the modal has rendered; otherwise animations/transitions won't work
					$circle.set({ value: 0 });
					break;
			}
		});
	}

	dismiss() {
		this.findUp(ModalContainer).close();
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
	onclick="${this.bind(`dismiss`)}"
	type="button"
>Dismiss</button>
	`;
}
