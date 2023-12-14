import { Component } from '@robertakarobin/web/component.ts';

const style = `
:host {
	background: #ff0000;
	height: 100px;
	width: 100px;
}
`;

export class TransitionTest extends Component {
	static style = style;

	static {
		this.init();
	}

	constructor() {
		super();
		this.on(`rendered`).subscribe(async() => {
			const $transition = this.$el!;
			$transition.style.background = `#ff0000`;
			await new Promise(requestAnimationFrame);
			$transition.style.transition = `background 5s`;
			$transition.style.background = `#0000ff`;
		});
	}

	template = () => `<div></div>`;
}
