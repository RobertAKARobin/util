import { Component } from '@robertakarobin/web/component.ts';

import { types } from '@src/theme.ts';

export class Textbox extends Component(`div`, {
	'data-maxlength': 10,
	'data-value': ``,
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
		this.setAttributes({ value: (event.currentTarget as HTMLInputElement).value });
		this.querySelector(`span`)!.innerHTML = this.remaining();
	}

	remaining() {
		return `${parseInt(this.get(`data-maxlength`)) - this.get(`data-value`).length} / ${this.get(`data-maxlength`)} Remaining`;
	}

	template = () => `
		<div>
			<input
				maxlength="${this.get(`data-maxlength`)}"
				placeholder="Type here"
				type="text"
				value="${this.get(`data-value`)}"
			>

			<span>${this.remaining()}</span>
		</div>
		`;
}
