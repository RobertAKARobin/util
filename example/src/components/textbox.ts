import { Component } from '@robertakarobin/web/component.ts';

import { types } from '@src/theme.ts';

type TextboxType = {
	maxlength: number;
	value: string;
};

export class Textbox extends Component<TextboxType> {

	static style = `
input {
	${types.body}
}
	`;

	static {
		this.init();
	}

	constructor(...[id, initial, ...args]: ConstructorParameters<typeof Component<TextboxType>>) {
		super(
			id,
			{
				...initial,
				maxlength: initial?.maxlength ?? 10,
				value: initial?.value ?? ``,
			},
			...args
		);
	}

	handleInput(event: Event) {
		this.set({
			...this.value,
			value: (event.currentTarget as HTMLInputElement).value,
		});
		this.$el.querySelector(`span`)!.innerHTML = this.remaining();
	}

	remaining() {
		return `${this.value.maxlength - this.value.value.length} / ${this.value.maxlength} Remaining`;
	}

	template = () => `
		<div>
			<input
				maxlength="${this.value.maxlength}"
				oninput=${this.bind(`handleInput`)}
				placeholder="Type here"
				type="text"
				value="${this.value.value}"
			>

			<span>${this.remaining()}</span>
		</div>
		`;
}
