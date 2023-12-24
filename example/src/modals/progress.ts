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
		circle.setAttributes({ 'data-value': 100 });
		circle.style.removeProperty(`transition`); // Undo the `style.transition = none`
		repaint(); // Force browser to start tweening after the modal has rendered; otherwise animations/transitions won't work
		circle.setAttributes({ 'data-value': 0 });
	}

	template = () => html`
<div>
	${ProgressCircle.get(`${this.id}-progess`).setAttributes({
		'data-border-width': 10,
		'data-diameter': 300,
		'data-max': 100,
		'data-min': 0,
		'data-value': 50,
	}).toString()}

	<button
		onclick="this.closest(ProgressModal).dismiss()"
		type="button"
	>Dismiss</button>
</div>
	`;
}
