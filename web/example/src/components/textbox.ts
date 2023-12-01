import { Component } from '@robertakarobin/web/index.ts';
import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

import { types } from '@src/theme.ts';

export class Textbox extends Component<Textbox> {
	static style = `
input {
	${types.body}
}
	`;

	maxlength: number;
	value = new Emitter<string>();

	constructor({ maxlength, value, ...attributes }: {
		maxlength?: number;
		value?: string;
	}) {
		super(attributes);
		this.maxlength = maxlength ?? 10;
		this.value.next(value ?? ``);
	}

	handleInput(event: Event) {
		this.value.next((event.currentTarget as HTMLInputElement).value);
		this.$el!.querySelector(`span`)!.innerHTML = this.remaining(); // TODO1: Better rerender
	}

	remaining() {
		return `${this.maxlength - this.value.last.length} / ${this.maxlength} Remaining`;
	}

	template = () => `
		<div>
			<input
				maxlength="${this.maxlength}"
				oninput=${this.bind(`handleInput`)}
				placeholder="Type here"
				type="text"
				value="${this.value.last}"
				${this.attrs()}
			>

			<span>${this.remaining()}</span>
		</div>
		`;
}

export default Component.toFunction(Textbox);
