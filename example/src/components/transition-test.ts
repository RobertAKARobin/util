import { Component } from '@robertakarobin/web/component.ts';

const style = `
:host {
	background: #ff0000;
	height: 100px;
	width: 100px;
}
`;

@Component.define()
export class TransitionTest extends Component {
	static style = style;

	async onPlace() {
		this.style.background = `#ff0000`;
		await new Promise(requestAnimationFrame);
		this.style.transition = `background 5s`;
		this.style.background = `#0000ff`;
	}
}
