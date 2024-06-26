import { Component } from './component.ts';

const style = /*css*/`
:host {
	display: contents;
}
`;

@Component.define()
export class ProgressCircle extends Component {
	static style = style;

	@Component.attribute() borderWidth = 10;
	readonly circle = this.findDown(`circle`);
	@Component.attribute() diameter = 100;
	@Component.attribute() max = 100;
	@Component.attribute() min = 0;

	get radius() {
		return (this.diameter - this.borderWidth) / 2;
	}

	@Component.attribute() value = 50;

	connectedCallback() {
		super.connectedCallback();

		this.on(`attributeChanged`, () => {
			if (this.isConnected === false) {
				return;
			}

			let percent =  (this.value / this.max) - this.min;
			percent = Math.min(1, percent);
			percent = Math.max(0, percent);

			const circumference = Math.round((this.radius * 2) * Math.PI);
			const length = Math.round(circumference * percent);
			const remainder = circumference - length;

			this.circle().style.strokeDasharray = `${length} ${remainder}`;
			this.circle().style.strokeDashoffset = `0`;
		});
	}

	template = () => /*html*/`
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
}
