import { Component } from '@robertakarobin/web/component.ts';

import { types } from '@src/theme.ts';

export class Textbox extends Component(`div`) {

	static style = `
input {
	${types.body}
}
	`;

	static {
		this.init();
	}

	maxlength = 10;
	value = ``;

	handleInput(event: Event) {
		this.value = (event.currentTarget as HTMLInputElement).value;
		this.querySelector(`span`)!.innerHTML = this.remaining();
	}

	remaining() {
		return `${this.maxlength - this.value.length} / ${this.maxlength} Remaining`;
	}

	template = () => `
		<div>
			<input
				maxlength="${this.maxlength}"
				placeholder="Type here"
				type="text"
				value="${this.value}"
			>

			<span>${this.remaining()}</span>
		</div>
		`;
}
