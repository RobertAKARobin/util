import { Component } from '@robertakarobin/util/component.ts';

import { Textbox } from '@src/components/textbox.ts';

@Component.define()
export class ListItem extends Component.custom(`li`) {
	@Component.attribute({ name: `data-text` }) text!: string;

	constructor(id: string) {
		super(id);
	}

	@Component.event()
	onDelete() {}

	@Component.event()
	onInput(event: CustomEvent<string>) {
		return event.detail;
	}

	template = () => /*html*/`
	<p>List item ID ${this.id}</p>

	${new Textbox(`${this.id}-text`)
		.set({ value: this.text })
		.on(`onInput`, event => this.onInput(event))
	}

	<button
		onclick="${this.bind(`onDelete`)}"
		type="button"
	>Remove</button>
	`;
}
