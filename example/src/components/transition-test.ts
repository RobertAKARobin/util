import { Component } from '@robertakarobin/util/components/component.ts';

@Component.define({
	stylePath: import.meta.url,
})
export class TransitionTest extends Component.custom(`div`) {
	async connectedCallback() {
		super.connectedCallback();

		this.style.background = `#ff0000`;
		await new Promise(requestAnimationFrame);
		this.style.transition = `background 5s`;
		this.style.background = `#0000ff`;
	}
}
