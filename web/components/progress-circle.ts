import { Component } from '../component.ts';

export class ProgressCircle extends Component(`div`, {
	borderWidth: 10,
	diameter: 100,
	max: 100,
	min: 0,
	value: 50,
}) {
	static {
		this.init();
	}

	get radius() {
		return (this.data.diameter - this.data.borderWidth) / 2;
	}

	onChange() {
		let percent =  this.data.value / (this.data.max - this.data.min);
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
	height="${this.data.diameter}"
	width="${this.data.diameter}"
>
	<foreignObject
		x="0"
		y="0"
		height="${this.data.diameter}"
		width="${this.data.diameter}"
	>${this.contents}</foreignObject>

  <circle
    stroke-width="${this.data.borderWidth}"
    r="${this.radius}"
    cx="${this.data.diameter / 2}"
    cy="${this.data.diameter / 2}"
		x="0"
		y="0"
	/>
</svg>
	`;
}
