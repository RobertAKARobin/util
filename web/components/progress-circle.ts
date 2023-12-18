import { Component } from '../component.ts';

type ProgressCircleParams = {
	borderWidth: number;
	diameter: number;
	max: number;
	min: number;
	value: number;
};

export class ProgressCircle extends Component<ProgressCircleParams> {
	get radius() {
		return (this.$.diameter - this.$.borderWidth) / 2;
	}

	onChange() {
		this.rerender();
	}

	onPlace() {
		this.rerender();
	}

	rerender() {
		if (this.$el === undefined) {
			return;
		}
		let percent =  this.$.value / (this.$.max - this.$.min);
		percent = Math.min(1, percent);
		percent = Math.max(0, percent);

		const circumference = Math.round((this.radius * 2) * Math.PI);
		const length = Math.round(circumference * percent);
		const remainder = circumference - length;

		const $circle = this.$el.querySelector(`circle`)!;
		$circle.style.strokeDasharray = `${length} ${remainder}`;
		$circle.style.strokeDashoffset = `0`;
	}

	template = () => `
<svg
	height="${this.$.diameter}"
	width="${this.$.diameter}"
>
	<foreignObject
		x="0"
		y="0"
		height="${this.$.diameter}"
		width="${this.$.diameter}"
	>${this.contents}</foreignObject>

  <circle
    stroke-width="${this.$.borderWidth}"
    r="${this.radius}"
    cx="${this.$.diameter / 2}"
    cy="${this.$.diameter / 2}"
		x="0"
		y="0"
	/>
</svg>
	`;
}
