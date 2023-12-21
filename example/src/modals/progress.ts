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

export class ProgressModal extends Component(`div`) {
	static style = style;

	static {
		this.init();
	}

	dismiss() {
		this.closest(ModalContainer).clear();
	}

	onPlace() {
		const circle = this.find(ProgressCircle);
		circle.style.transition = `none`; // Force circle to reset without tweening
		circle.attrs({ value: 100 });
		circle.style.removeProperty(`transition`); // Undo the `style.transition = none`
		repaint(); // Force browser to start tweening after the modal has rendered; otherwise animations/transitions won't work
		circle.attrs({ value: 0 });
	}

	template = () => html`
<div>
	${ProgressCircle.get(`${this.id}-progess`).set({
		borderWidth: 10,
		diameter: 300,
		max: 100,
		min: 0,
		value: 50,
	}).toString()}

	<button
		onclick="this.closest(ProgressModal).dismiss()"
		type="button"
	>Dismiss</button>
</div>
	`;
}
