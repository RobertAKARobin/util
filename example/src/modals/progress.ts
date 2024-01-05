import { Component, css, html } from '@robertakarobin/web/component.ts';
import { ModalContainer } from '@robertakarobin/web/components/modal-container.ts';
import { ProgressCircle } from '@robertakarobin/web/components/progress-circle.ts';
import { repaint } from '@robertakarobin/util/repaint.ts';

const style = css`
:host {
	& circle {
		stroke: #ff0000;
		transition: stroke-dasharray 10s;
	}
}
`;

@Component.define()
export class ProgressModal extends Component {
	static style = style;

	$onPlace() {
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
		this.findUp(ModalContainer).clear();
	}

	template = () => html`
${ProgressCircle.get().set({
	borderWidth: 10,
	diameter: 300,
	max: 100,
	min: 0,
	value: 50,
}).toString()}

<button
	onclick="${this.bind(`dismiss`)}"
	type="button"
>Dismiss</button>
	`;
}
