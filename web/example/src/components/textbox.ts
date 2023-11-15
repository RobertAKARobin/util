import { Component } from '@robertakarobin/web/index.ts';

import { types } from '../theme.ts';

export class Textbox extends Component {
	static style = `
input {
	${types.body}
}
	`;

	max = 10;
	value = ``;

	handleInput(event: Event) {
		this.value = (event.currentTarget as HTMLInputElement).value;
		this.$root!.querySelector(`span`)!.innerHTML = this.remaining(); // TODO2: Better rerender
	}

	remaining() {
		return `
		${this.max - this.value.length} / ${this.max} Remaining
		`;
	}

	template() {
		return `
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
}

export default Component.toFunction(Textbox);
