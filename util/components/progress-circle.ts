import { Component } from './component';

const style = /*css*/`
:host {
	display: contents;
}
`;

export const ProgressCircle = Component.define(class extends Component {
	static override style = style;
	borderWidth = 10;
	diameter = 100;
	max = 100;
	min = 0;

	get radius() {
		return (this.diameter - this.borderWidth) / 2;
	}

	value = 50;

	readonly circle = () => this.findDown(`circle`)[0];

	override connectedCallback() {
		super.connectedCallback();

		this.onEvent(`attributeChanged`, () => {
			if (this.isConnected === false) {
				return;
			}

			let percent = (this.value / this.max) - this.min;
			percent = Math.min(1, percent);
			percent = Math.max(0, percent);

			const circumference = Math.round((this.radius * 2) * Math.PI);
			const length = Math.round(circumference * percent);
			const remainder = circumference - length;

			this.circle().style.strokeDasharray = `${length} ${remainder}`;
			this.circle().style.strokeDashoffset = `0`;
		});
	}

	override template = () => /*html*/`
<svg
	height="${this.diameter}"
	width="${this.diameter}"
>
	<foreignObject
		x="0"
		y="0"
		height="${this.diameter}"
		width="${this.diameter}"
	>${this.content}</foreignObject>

  <circle
    stroke-width="${this.borderWidth}"
    r="${this.radius}"
    cx="${this.diameter / 2}"
    cy="${this.diameter / 2}"
	/>
</svg>
	`;
},
{
	attributes: [
		`borderWidth`,
		`diameter`,
		`max`,
		`min`,
		`value`,
	],
});
