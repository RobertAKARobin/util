import { ComponentFactory } from '../component.ts';

const style = `
:host {
	display: contents;
}
`;

export class ProgressCircle extends ComponentFactory(`div`, {
	'data-border-width': {
		default: 10,
	},
	'data-diameter': {
		default: 100,
	},
	'data-max': {
		default: 100,
	},
	'data-min': {
		default: 0,
	},
	'data-value': {
		default: 50,
	},
}) {
	static style = style;

	static {
		this.init();
	}

	get radius() {
		return (this.get(`data-diameter`) - this.get(`data-border-width`)) / 2;
	}

	onChange() {
		if (!this.isConnected) {
			return;
		}

		let percent =  (this.get(`data-value`) / this.get(`data-max`)) - this.get(`data-min`);
		percent = Math.min(1, percent);
		percent = Math.max(0, percent);

		const circumference = Math.round((this.radius * 2) * Math.PI);
		const length = Math.round(circumference * percent);
		const remainder = circumference - length;

		const $circle = this.querySelector(`circle`)!;
		$circle.style.strokeDasharray = `${length} ${remainder}`;
		$circle.style.strokeDashoffset = `0`;
	}

	onPlace() {
		this.onChange();
	}

	template = () => `
<svg
	height="${this.get(`data-diameter`)}"
	width="${this.get(`data-diameter`)}"
>
	<foreignObject
		x="0"
		y="0"
		height="${this.get(`data-diameter`)}"
		width="${this.get(`data-diameter`)}"
	>${this.contents}</foreignObject>

  <circle
    stroke-width="${this.get(`data-border-width`)}"
    r="${this.radius}"
    cx="${this.get(`data-diameter`) / 2}"
    cy="${this.get(`data-diameter`) / 2}"
		x="0"
		y="0"
	/>
</svg>
	`;
}
