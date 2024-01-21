import { Component } from '@robertakarobin/util/component.ts';

const style = /*css*/`
:host {
	background: #ff0000;
	height: 100px;
	width: 100px;
}
`;

@Component.define({ style })
export class TransitionTest extends Component.custom(`div`) {
	async connectedCallback() {
		this.style.background = `#ff0000`;
		await new Promise(requestAnimationFrame);
		this.style.transition = `background 5s`;
		this.style.background = `#0000ff`;
	}
}
