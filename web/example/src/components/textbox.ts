import { Component } from '@robertakarobin/web/index.ts';
import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

import { types } from '@src/theme.ts';

export class Textbox extends Component<{ value?: string; }> {

	static style = `
input {
	${types.body}
}
	`;

	maxlength: number;
	value = new Emitter<string>();

	constructor(args: {
		id?: string;
		maxlength?: number;
		value?: string;
	}) {
		super(args);
		this.maxlength = args.maxlength ?? 10;
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
			>

			<span>${this.remaining()}</span>
		</div>
		`;
}
