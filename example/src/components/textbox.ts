import { ComponentFactory } from '@robertakarobin/web/component.ts';

import { types } from '@src/theme.ts';

export class Textbox extends ComponentFactory(`div`, {
	'data-maxlength': {
		default: 10,
		fromString: parseInt,
	},
	'data-value': {
		default: ``,
	},
}) {

	static style = `
input {
	${types.body}
}
	`;

	static {
		this.init();
	}

	handleInput(event: Event) {
		this.set({ 'data-value': (event.currentTarget as HTMLInputElement).value });
		this.querySelector(`span`)!.innerHTML = this.remaining();
	}

	remaining() {
		return `${this.get(`data-maxlength`) - this.get(`data-value`).length} / ${this.get(`data-maxlength`)} Remaining`;
	}

	template = () => `
<input
	maxlength="${this.get(`data-maxlength`)}"
	oninput="${this.bind(`handleInput`)}"
	placeholder="Type here"
	type="text"
	value="${this.get(`data-value`)}"
>

<span>${this.remaining()}</span>
		`;
}
