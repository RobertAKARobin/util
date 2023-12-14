import { Component, css, html } from '@robertakarobin/web/component.ts';
import { ProgressCircle } from '@robertakarobin/web/components/progress-circle.ts';
import { repaint } from '@robertakarobin/util/repaint.ts';

import type * as Type from '@src/types.d.ts';
import { modalContainer } from '@src/state.ts';

const style = css`
:host {
	& circle {
		stroke: #ff0000;
		transition: stroke-dasharray 10s;
	}
}
`;

export class ProgressModal extends Component<Type.List> {
	static style = style;

	static {
		this.init();
	}

	constructor() {
		super();
		this.on(`rendered`).subscribe(() => {
			const circle = this.find(ProgressCircle);

			circle.$el!.style.transition = `none`; // Force circle to reset without tweening
			circle.patch({ value: 100 });
			circle.$el!.style.removeProperty(`transition`); // Undo the `style.transition = none`
			repaint(); // Force browser to start tweening after the modal has rendered; otherwise animations/transitions won't work
			circle.patch({ value: 0 });
		});
	}

	dismiss() {
		modalContainer.clear();
	}

	template = () => html`
<div>
	${new ProgressCircle({
		borderWidth: 10,
		diameter: 300,
		max: 100,
		min: 0,
		value: 50,
	}).render()}

	<button
		onclick=${this.bind(`dismiss`)}
		type="button"
	>Dismiss</button>
</div>
	`;
}
