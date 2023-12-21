import { Component } from '@robertakarobin/web/component.ts';

import { types } from '@src/theme.ts';

export class Textbox extends Component(`div`, {
	maxlength: 10,
	value: ``,
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
		this.data.value = (event.currentTarget as HTMLInputElement).value;
		this.querySelector(`span`)!.innerHTML = this.remaining();
	}

	remaining() {
		return `${this.data.maxlength - this.data.value.length} / ${this.data.maxlength} Remaining`;
	}

	template = () => `
		<div>
			<input
				maxlength="${this.data.maxlength}"
				placeholder="Type here"
				type="text"
				value="${this.data.value}"
			>

			<span>${this.remaining()}</span>
		</div>
		`;
}
