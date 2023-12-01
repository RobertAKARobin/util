import { Component } from '@robertakarobin/web/index.ts';

import { types } from '@src/theme.ts';

export class Textbox extends Component<Textbox> {
	static style = `
input {
	${types.body}
}
	`;

	maxlength: number;
	value: string;

	constructor({ maxlength, value, ...attributes }: {
		maxlength?: number;
		value?: string;
	}) {
		super(attributes);
		this.maxlength = maxlength ?? 10;
		this.value = value ?? ``;
	}

	handleInput(event: Event) {
		this.value = (event.currentTarget as HTMLInputElement).value;
		this.$el!.querySelector(`span`)!.innerHTML = this.remaining(); // TODO1: Better rerender
	}

	remaining() {
		return `
		${this.maxlength - this.value.length} / ${this.maxlength} Remaining
		`;
	}

	template = () => `
		<div>
			<input
				oninput=${this.bind(`handleInput`)}
				placeholder="Type here"
				type="text"
				${this.attrs()}
			>

			<span>${this.remaining()}</span>
		</div>
		`;
}

export default Component.toFunction(Textbox);
