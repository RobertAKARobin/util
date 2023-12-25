import { Component } from '../component.ts';

const style = `
:host {
	display: contents;
}
`;

export class ProgressCircle extends Component(`div`, {
	'data-border-width': 10,
	'data-diameter': 100,
	'data-max': 100,
	'data-min': 0,
	'data-value': 50,
}) {
	static style = style;

	static {
		this.init();
	}

	get radius() {
		return (parseFloat(this.get(`data-diameter`)) - parseFloat(this.get(`data-border-width`))) / 2;
	}

	onChange() {
		if (!this.isConnected) {
			return;
		}
		let percent =  parseFloat(this.get(`data-value`)) / (parseFloat(this.get(`data-max`)) - parseFloat(this.get(`data-min`)));
		percent = Math.min(1, percent);
		percent = Math.max(0, percent);

		const circumference = Math.round((this.radius * 2) * Math.PI);
		const length = Math.round(circumference * percent);
		const remainder = circumference - length;

		console.log(`${length} ${remainder}`);

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
    cx="${parseFloat(this.get(`data-diameter`)) / 2}"
    cy="${parseFloat(this.get(`data-diameter`)) / 2}"
		x="0"
		y="0"
	/>
</svg>
	`;
}
