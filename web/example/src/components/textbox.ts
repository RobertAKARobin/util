import { Component } from '@robertakarobin/web/index.ts';

import { types } from '../theme.ts';

export class Textbox extends Component {
	static style = `
input {
	${types.body}
}
	`;

	constructor(
		public max = 10,
		public value = ``,
	) {
		super();
	}

	handleInput(event: Event) {
		this.value = (event.currentTarget as HTMLInputElement).value;
		this.$el!.querySelector(`span`)!.innerHTML = this.remaining(); // TODO1: Better rerender
	}

	remaining() {
		return `
		${this.max - this.value.length} / ${this.max} Remaining
		`;
	}

	template = () => `
		<div>
			<input
				oninput=${this.bind(`handleInput`)}
				maxlength="${this.max}"
				placeholder="Type here"
				type="text"
				value="${this.value}"
			>

			<span>${this.remaining()}</span>
		</div>
		`;
}

export default Component.register(Textbox);
